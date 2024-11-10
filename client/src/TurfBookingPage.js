import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const TurfBookingPage = () => {
  const { id } = useParams();
  const { loginWithRedirect, isAuthenticated, user } = useAuth0();
  const [turf, setTurf] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: '',
    duration: '',
    sport: '',
  });
  const [timeSlots, setTimeSlots] = useState([]);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  useEffect(() => {
    const fetchTurf = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/turfs/${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTurf(data);
      } catch (error) {
        console.error('Error fetching turf details:', error);
      }
    };

    fetchTurf();

    // Generate available time slots from 6:00 AM to 11:30 PM
    const slots = [];
    for (let h = 6; h <= 23; h++) {
      for (let m = 0; m < 60; m += 30) {
        const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        slots.push(time);
      }
    }
    setTimeSlots(slots);

    // Retrieve booking details from localStorage if they exist
    const savedDetails = JSON.parse(localStorage.getItem('bookingDetails'));
    if (savedDetails) {
      setBookingDetails(savedDetails);
    }
  }, [id]);

  const handleBookingDetailsChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prevDetails) => {
      const newDetails = { ...prevDetails, [name]: value };
      // Save updated details to localStorage
      localStorage.setItem('bookingDetails', JSON.stringify(newDetails));
      return newDetails;
    });
  };

  const handleBookTurf = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    if (!isAuthenticated) {
      // If the user is not authenticated, prompt for login
      await loginWithRedirect({
        appState: {
          targetUrl: window.location.href, // Retain the current URL for redirect after login
        },
      });
      return; // Prevent further execution
    }

    // If authenticated, proceed with booking
    const bookingData = {
      userId: user.email, // Store the logged-in user's email
      turfId: turf._id,
      turfName: turf.name, // Include turf name
      ...bookingDetails,
      userEmail: user.email,
    };

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      

      if (!response.ok) {
        throw new Error('Error submitting booking');
      }

      

      // Set confirmation message
      setConfirmationMessage('Booking confirmed successfully!');

      // Reset booking details after successful booking
      setBookingDetails({
        date: '',
        time: '',
        duration: '',
        sport: '',
      });

      // Clear booking details from localStorage after successful booking
      localStorage.removeItem('bookingDetails');
    } catch (error) {
      console.error('Error booking turf:', error);
      // setConfirmationMessage('Error confirming booking. Please try again.');
      setConfirmationMessage('Turf is unavailable during the selected time slot.');
    }
  };

  if (!turf) {
    return <div className="text-center text-3xl font-bold mt-20">Loading...</div>;
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center" 
      style={{ 
        backgroundImage: 'url(https://media.istockphoto.com/id/1364087370/photo/grass-field.jpg?s=612x612&w=0&k=20&c=G4Kc4I0gfFB8AYnVYUblkua31YHj2TS6pSf2wSvVzFQ=)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      }}
    >
      <div className="bg-white p-8 shadow-2xl rounded-lg overflow-hidden max-w-xl w-full">
        <div className="relative mb-4">
          <img
            src={`http://localhost:5000${turf.image}`}
            alt={turf.name}
            className="h-64 w-full object-cover rounded-lg shadow-md"
          />
        </div>
        <div className="p-4 space-y-4">
          <h1 className="text-3xl font-bold text-green-500 text-center">{turf.name}</h1>
          <p className="text-lg text-gray-700 text-center">{turf.description}</p>
          <p className="text-lg font-semibold text-center">
            Price: <span className="text-green-500">${turf.price}/hour</span>
          </p>

          <h2 className="text-2xl font-bold mt-6 mb-4 text-green-500 text-center">Booking Details</h2>

          <div className="grid place-items-center">
            <div className="bg-gray-100 p-6 rounded-lg shadow-md w-full">
              <form onSubmit={handleBookTurf} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sport">
                    Select Sport:
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="sport"
                    name="sport"
                    value={bookingDetails.sport}
                    onChange={handleBookingDetailsChange}
                    required
                  >
                    <option value="" disabled>Select a sport</option>
                    <option value="Football">Football</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Tennis">Tennis</option>
                    {/* Add more sports as needed */}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                    Date:
                  </label>
                  <input
                    type="date"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="date"
                    name="date"
                    value={bookingDetails.date}
                    onChange={handleBookingDetailsChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
                    Time:
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="time"
                    name="time"
                    value={bookingDetails.time}
                    onChange={handleBookingDetailsChange}
                    required
                  >
                    <option value="" disabled>Select a time</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="duration">
                    Duration (in hours):
                  </label>
                  <input
                    type="number"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="duration"
                    name="duration"
                    value={bookingDetails.duration}
                    onChange={handleBookingDetailsChange}
                    required
                    min="1"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline w-full transition duration-300 ease-in-out shadow-lg transform hover:scale-105"
                >
                  Book Turf
                </button>

                {confirmationMessage && (
                  <p className="text-center text-lg text-green-600">{confirmationMessage}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurfBookingPage;






