const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const sendBookingEmail = require('./mailer');
const { Kafka } = require('kafkajs');
const moment = require('moment');
const axios = require('axios');

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
    const bookingDay = moment(date, 'YYYY-MM-DD').format('dddd'); // Get day of the week (e.g., Monday)

    try {
        // Fetch turf timings for the selected turf
        const turfTiming = await TurfTiming.findOne({ turfName });

        if (!turfTiming) {
            return res.status(404).json({ message: 'Turf timings not found for this turf.' });
        }

        // Check if the turf is available on the selected day
        if (!turfTiming.days_available.includes(bookingDay)) {
            return res.status(400).json({ message: `Turf is not available on ${bookingDay}.` });
        }

        // Check if the booking time falls within the allowed turf timing
        const openingTime = moment(`${date} ${turfTiming.openingTime}`, 'YYYY-MM-DD HH:mm');
        const closingTime = moment(`${date} ${turfTiming.closingTime}`, 'YYYY-MM-DD HH:mm');

        if (bookingStart.isBefore(openingTime) || bookingEnd.isAfter(closingTime)) {
            return res.status(400).json({ message: 'Booking time is outside the turf’s operating hours.' });
        }


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


app.post('/send-booking-email', async (req, res) => {
    const { userEmail, bookingDetails } = req.body;

    if (!userEmail || !bookingDetails) {
        return res.status(400).send('Missing email or booking details');
    }

    try {
        // Send booking email
        await sendBookingEmail(userEmail, bookingDetails);

        // Send booking details to Kafka
        await sendBookingToKafka(bookingDetails);

        res.status(200).send('Email sent and booking details published to Kafka successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error processing booking');
    }
});


// Logout endpoint
app.post('/api/logout', async (req, res) => {
    try {
      // Send a request to the FastAPI server to clear the user email
      const response = await axios.post('http://localhost:8000/api/send-email', {
        email: null, // Set user_email to None
      });
  
      res.status(200).json({
        message: 'User email cleared successfully in FastAPI',
        fastApiResponse: response.data,
      });
    } catch (error) {
      console.error('Error clearing user email:', error.message);
      res.status(500).json({ message: 'Failed to clear user email' });
    }
});





// Define the TurfOwner schema
const turfOwnerSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, // Email must be unique and required
    turf: { type: String, required: true }, // The turf name as a string
});

// Create and export the TurfOwner model
const TurfOwner = mongoose.model('TurfOwner', turfOwnerSchema);



// Check if the user is a turf owner
app.post('/api/check-turfowner', async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
  
    try {
      // Query MongoDB to find the email in the turfowners collection
      const turfOwner = await TurfOwner.findOne({ email });
  
      if (turfOwner) {
        return res.json({ isTurfOwner: true });
      } else {
        return res.json({ isTurfOwner: false });
      }
    } catch (error) {
      console.error('Error checking turf owner:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });


  app.get('/api/turfowners', async (req, res) => {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
  
    try {
      const turfOwner = await TurfOwner.findOne({ email });
      
      if (!turfOwner) {
        return res.status(404).json({ error: 'Turf owner not found' });
      }
      
      // Return the turf details if the turf owner is found
      res.json({ turf: turfOwner.turf });
  
    } catch (error) {
      console.error('Error fetching turf owner:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });



  const turfTimingSchema = new mongoose.Schema({
    turfName: { type: String, required: true },
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },
    days_available: { type: [String], required: true }, // Array of strings to store days
});

const TurfTiming = mongoose.model('TurfTiming', turfTimingSchema, 'turfTimings');






app.post('/api/turfTimings', async (req, res) => {
    const { turfName, openingTime, closingTime, days_available } = req.body; // Include the fields
    const loggedInUserEmail = req.headers['x-user-email']; // Get logged-in user's email (make sure it's passed correctly)

    if (!loggedInUserEmail) {
        return res.status(400).json({ message: 'User email is required' });
    }

    try {
        // Find if the logged-in user owns the turf
        const turfOwner = await TurfOwner.findOne({ email: loggedInUserEmail });

        if (!turfOwner) {
            return res.status(404).json({ message: 'Turf owner not found' });
        }

        // Ensure the turfName matches the turf owned by the user
        if (turfOwner.turf !== turfName) {
            return res.status(403).json({ message: 'You are not authorized to update this turf\'s timings' });
        }

        // Check if a timing record already exists for the turfName
        const existingTiming = await TurfTiming.findOne({ turfName });

        if (existingTiming) {
            // Update only the fields provided in the request body
            if (openingTime) existingTiming.openingTime = openingTime;
            if (closingTime) existingTiming.closingTime = closingTime;
            if (days_available) existingTiming.days_available = days_available;
            await existingTiming.save();
            res.status(200).json({ message: 'Record updated successfully' });
        } else {
            // Ensure all fields are required for creating a new record
            if (!openingTime || !closingTime || !days_available) {
                return res.status(400).json({ message: 'All fields are required to create a new record' });
            }

            const newTiming = new TurfTiming({
                turfName,
                openingTime,
                closingTime,
                days_available,
            });
            await newTiming.save();
            res.status(201).json({ message: 'Record saved successfully' });
        }
    } catch (error) {
        console.error('Error saving record:', error);
        res.status(500).json({ message: 'Error saving record' });
    }
});

app.delete('/api/bookings/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedBooking = await Booking.findByIdAndDelete(id);
        if (!deletedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json({ message: 'Booking canceled successfully' });
    } catch (error) {
        console.error('Error canceling booking:', error);
        res.status(500).json({ message: 'Error canceling booking' });
    }
});

app.get('/api/bookings', async (req, res) => {
    const { name } = req.query;
    try {
        const bookings = await Booking.find({ turfName: name });
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings' });
    }
});



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
