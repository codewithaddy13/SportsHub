const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const sendBookingEmail = require('./mailer');
const { Kafka } = require('kafkajs');
const moment = require('moment');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static images from the 'images' directory
app.use('/images', express.static(path.join(__dirname, 'images')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/fsd_database')
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Turf model
const turfSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    location: String,
    description: String,
});

const Turf = mongoose.model('Turf', turfSchema, 'turfs');

// Booking model
const bookingSchema = new mongoose.Schema({
    turfId: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf' },
    turfName: String,
    userId: String,
    date: String,
    time: String,
    duration: Number,
    sport: String,
    userEmail: String,
});

const Booking = mongoose.model('Booking', bookingSchema, 'bookings');

// Analysis model
const analysisSchema = new mongoose.Schema({
    peakTimes: String,
    morningCount: Number,
    afternoonCount: Number,
    eveningCount: Number,
    nightCount: Number,
    popularTurfs: [{ name: String, count: Number }],
});

const Analysis = mongoose.model('Analysis', analysisSchema, 'analysis');

// Kafka setup
const kafka = new Kafka({
    clientId: 'turf-booking-app',
    brokers: ['localhost:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'turf-booking-consumer-group' });

// Function to send booking data to Kafka topic
const sendBookingToKafka = async (bookingData) => {
    try {
        await producer.send({
            topic: 'turfBookings',
            messages: [
                { value: JSON.stringify(bookingData) }
            ]
        });
        console.log('Booking sent to Kafka:', bookingData);
    } catch (error) {
        console.error('Error sending booking to Kafka:', error);
    }
};



const analyzeBookings = async () => {
    const bookings = await Booking.find(); // Fetch all bookings
    // Initialize time period counts
    const timeCounts = {
        Morning: 0,
        Afternoon: 0,
        Evening: 0,
        Night: 0,
    };
    // Initialize turf booking counts
    const turfCounts = {};

    bookings.forEach(booking => {
        const bookingDateTime = moment(`${booking.date} ${booking.time}`, 'YYYY-MM-DD HH:mm'); // Combine date and time
        const hour = bookingDateTime.hours(); // Correctly extract hour from combined date and time
        const timePeriod = getTimePeriod(hour); // Get time period (e.g., "Morning", "Afternoon", etc.)
        // Count bookings by time period
        timeCounts[timePeriod] = (timeCounts[timePeriod] || 0) + 1;
        // Count bookings for each turf
        turfCounts[booking.turfName] = (turfCounts[booking.turfName] || 0) + 1;
    });

    // Determine peak time period
    const peakTime = Object.keys(timeCounts).reduce((a, b) => timeCounts[a] > timeCounts[b] ? a : b);

    // Get the top 3 most popular turfs
    const popularTurfs = Object.entries(turfCounts)
        .sort((a, b) => b[1] - a[1]) // Sort by booking count in descending order
        .slice(0, 3) // Get top 3 turfs
        .map(([name, count]) => ({ name, count }));

    // Save or update analysis results in MongoDB in the requested format
    await Analysis.updateOne({}, {
        peakTimes: peakTime,
        morningCount: timeCounts.Morning,
        afternoonCount: timeCounts.Afternoon,
        eveningCount: timeCounts.Evening,
        nightCount: timeCounts.Night,
        popularTurfs: popularTurfs,
    }, { upsert: true });

    console.log('Analysis results updated:', {
        peakTimes: peakTime,
        morningCount: timeCounts.Morning,
        afternoonCount: timeCounts.Afternoon,
        eveningCount: timeCounts.Evening,
        nightCount: timeCounts.Night,
        popularTurfs: popularTurfs,
    });
};


// Function to get the time period
const getTimePeriod = (hour) => {
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
};

// Connect producer and consumer
const startKafka = async () => {
    await producer.connect();
    console.log('Kafka Producer connected');

    await consumer.connect();
    console.log('Kafka Consumer connected');

    await consumer.subscribe({ topic: 'turfBookings', fromBeginning: true });

    consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const bookingData = JSON.parse(message.value.toString());
            console.log('Received booking data:', bookingData);

            try {
                // Analyze bookings after each message is received
                await analyzeBookings();
            } catch (error) {
                console.error('Error during analysis:', error);
            }
        },
    });
};

// Start Kafka connection
startKafka().catch(console.error);

// Get all turfs
app.get('/api/turfs', async (req, res) => {
    try {
        const turfs = await Turf.find();
        res.json(turfs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching turfs' });
    }
});

app.get('/api/analysis', async (req, res) => {
    try {
        const analysis = await Analysis.findOne(); // Assuming you store one analysis document
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analysis data' });
    }
});

// Get a single turf by ID
app.get('/api/turfs/:id', async (req, res) => {
    try {
        const turf = await Turf.findById(req.params.id);
        if (!turf) {
            return res.status(404).json({ message: 'Turf not found' });
        }
        res.json(turf);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching turf' });
    }
});

app.post('/api/bookings', async (req, res) => {
    const { turfId, date, time, duration, turfName, userId, sport, userEmail } = req.body;

    const bookingStart = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
    const bookingEnd = moment(bookingStart).add(duration, 'hours');

    try {
        const existingBookings = await Booking.find({
            turfId: turfId,
            date: date
        });

        const isOverlap = existingBookings.some(existingBooking => {
            const existingStart = moment(`${existingBooking.date} ${existingBooking.time}`, 'YYYY-MM-DD HH:mm');
            const existingEnd = moment(existingStart).add(existingBooking.duration, 'hours');

            return bookingStart.isBefore(existingEnd) && bookingEnd.isAfter(existingStart);
        });

        if (isOverlap) {
            return res.status(409).json({ message: 'Turf is unavailable during the selected time slot.' });
        }

        const newBooking = new Booking({
            turfId,
            turfName,
            userId,
            date,
            time,
            duration,
            sport,
            userEmail
        });

        const savedBooking = await newBooking.save();
        
        await sendBookingEmail(userEmail, { turfName, date, time, duration, sport });
        await sendBookingToKafka({ turfId, turfName, userId, date, time, duration, sport, userEmail });

        res.status(201).json(savedBooking);
    } catch (error) {
        console.error('Error saving booking:', error);
        res.status(500).json({ message: 'Error saving booking', error });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});












