// import React, { useState, useEffect } from 'react';

// const TurfOwnerDashboard = () => {
//   const [bookings, setBookings] = useState([]);
//   const [openingTime, setOpeningTime] = useState('');
//   const [closingTime, setClosingTime] = useState('');
//   const [selectedDays, setSelectedDays] = useState([]);
//   const [turfName, setTurfName] = useState('');

//   const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

//   // Fetch turf details based on logged-in user's email
//   useEffect(() => {
//     const fetchTurfDetails = async () => {
//       try {
//         const userEmail = localStorage.getItem('loggedInUserEmail'); // Assuming the email is stored in localStorage
//         console.log('Logged-in user email:', userEmail);
//         const response = await fetch(`http://localhost:5000/api/turfowners?email=${userEmail}`);
//         const data = await response.json();
//         if (data && data.turf) {
//           setTurfName(data.turf);
//         } else {
//           console.error('No turf found for the logged-in user.');
//         }
//       } catch (error) {
//         console.error('Error fetching turf details:', error);
//       }
//     };

//     fetchTurfDetails();
//   }, []);

//   // Fetch upcoming bookings for the turf
//   useEffect(() => {
//     if (!turfName) return;

//     const fetchBookings = async () => {
//       try {
//         const response = await fetch(`http://localhost:5000/api/bookings?name=${encodeURIComponent(turfName)}`);
//         const data = await response.json();
//         const currentDate = new Date().toISOString().split('T')[0];
//         const filteredBookings = data.filter(booking => booking.date >= currentDate);
//         setBookings(filteredBookings);
//       } catch (error) {
//         console.error('Error fetching bookings:', error);
//       }
//     };

//     fetchBookings();
//   }, [turfName]);

//   // Handle cancel booking
//   const handleCancelBooking = async (id) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/bookings/${id}`, {
//         method: 'DELETE',
//       });
//       if (response.ok) {
//         setBookings(bookings.filter(booking => booking._id !== id));
//         alert('Booking canceled successfully');
//       } else {
//         alert('Failed to cancel booking');
//       }
//     } catch (error) {
//       console.error('Error canceling booking:', error);
//     }
//   };

  

//   // Handle save timings
// const handleSaveTimings = async () => {
//   try {
//     const response = await fetch('http://localhost:5000/api/turfTimings', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-user-email': localStorage.getItem('loggedInUserEmail'),  // Send logged-in user's email in headers
//       },
//       body: JSON.stringify({
//         turfName,
//         openingTime,
//         closingTime,
//       }),
//     });

//     if (response.ok) {
//       alert('Timings saved successfully');
//     } else {
//       const data = await response.json();
//       alert(data.message || 'Failed to save timings');
//     }
//   } catch (error) {
//     console.error('Error saving timings:', error);
//   }
// };

// // Handle save days
// const handleSaveDays = async () => {
//   try {
//     const response = await fetch('http://localhost:5000/api/turfTimings', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-user-email': localStorage.getItem('loggedInUserEmail'),  // Send logged-in user's email in headers
//       },
//       body: JSON.stringify({
//         turfName,
//         days_available: selectedDays,
//       }),
//     });

//     if (response.ok) {
//       alert('Days available updated successfully');
//     } else {
//       const data = await response.json();
//       alert(data.message || 'Failed to update days available');
//     }
//   } catch (error) {
//     console.error('Error saving days available:', error);
//   }
// };


//   // Toggle day selection
//   const toggleDaySelection = (day) => {
//     setSelectedDays(prev => {
//       if (prev.includes(day)) {
//         return prev.filter(d => d !== day);
//       } else {
//         return [...prev, day];
//       }
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 py-12">
//       <div className="container mx-auto px-6">
//         <h1 className="text-4xl font-bold text-center text-blue-700 mb-10">
//           Turf Owner Dashboard
//         </h1>

//         {turfName ? (
//           <>
//             {/* Display upcoming bookings */}
//             <section className="mb-12">
//               <h2 className="text-2xl font-semibold text-blue-600 mb-6">
//                 Upcoming Bookings for {turfName}
//               </h2>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//                 {bookings.length > 0 ? (
//                   bookings.map(booking => (
//                     <div key={booking._id} className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
//                       <p className="text-gray-700">
//                         <strong>Date:</strong> {booking.date}
//                       </p>
//                       <p className="text-gray-700">
//                         <strong>Time:</strong> {booking.time}
//                       </p>
//                       <p className="text-gray-700">
//                         <strong>Duration:</strong> {booking.duration} hour(s)
//                       </p>
//                       <p className="text-gray-700">
//                         <strong>Sport:</strong> {booking.sport}
//                       </p>
//                       <p className="text-gray-700">
//                         <strong>User Email:</strong> {booking.userEmail}
//                       </p>
//                       <button
//                         className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded mt-4 w-full"
//                         onClick={() => handleCancelBooking(booking._id)}
//                       >
//                         Cancel Booking
//                       </button>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-gray-500 italic">No upcoming bookings.</p>
//                 )}
//               </div>
//             </section>

//             {/* Set opening and closing timings */}
//             <section className="mb-12">
//               <h2 className="text-2xl font-semibold text-blue-600 mb-6">
//                 Set Turf Timings
//               </h2>
//               <div className="bg-white rounded-lg shadow-lg p-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                   <div>
//                     <label className="block font-semibold text-gray-700 mb-2">
//                       Opening Time:
//                     </label>
//                     <input
//                       type="time"
//                       value={openingTime}
//                       onChange={(e) => setOpeningTime(e.target.value)}
//                       className="p-3 border rounded w-full focus:ring focus:ring-blue-200"
//                     />
//                   </div>
//                   <div>
//                     <label className="block font-semibold text-gray-700 mb-2">
//                       Closing Time:
//                     </label>
//                     <input
//                       type="time"
//                       value={closingTime}
//                       onChange={(e) => setClosingTime(e.target.value)}
//                       className="p-3 border rounded w-full focus:ring focus:ring-blue-200"
//                     />
//                   </div>
//                 </div>
//                 <button
//                   className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded w-full"
//                   onClick={handleSaveTimings}
//                 >
//                   Save Timings
//                 </button>
//               </div>
//             </section>

//             {/* Set days available */}
//             <section>
//               <h2 className="text-2xl font-semibold text-blue-600 mb-6">
//                 Set Days Available
//               </h2>
//               <div className="bg-white rounded-lg shadow-lg p-6">
//                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
//                   {daysOfWeek.map(day => (
//                     <div key={day} className="flex items-center">
//                       <input
//                         type="checkbox"
//                         id={day}
//                         checked={selectedDays.includes(day)}
//                         onChange={() => toggleDaySelection(day)}
//                         className="mr-2"
//                       />
//                       <label htmlFor={day} className="font-medium text-gray-700">
//                         {day}
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//                 <button
//                   className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded w-full"
//                   onClick={handleSaveDays}
//                 >
//                   Save Days
//                 </button>
//               </div>
//             </section>
//           </>
//         ) : (
//           <p className="text-center text-gray-500 italic">Loading your turf dashboard...</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TurfOwnerDashboard;





import React, { useState, useEffect } from 'react';

const TurfOwnerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [turfName, setTurfName] = useState('');

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    const fetchTurfDetails = async () => {
      try {
        const userEmail = localStorage.getItem('loggedInUserEmail');
        console.log('Logged-in user email:', userEmail);
        const response = await fetch(`http://localhost:5000/api/turfowners?email=${userEmail}`);
        const data = await response.json();
        if (data && data.turf) {
          setTurfName(data.turf);
        } else {
          console.error('No turf found for the logged-in user.');
        }
      } catch (error) {
        console.error('Error fetching turf details:', error);
      }
    };

    fetchTurfDetails();
  }, []);

  useEffect(() => {
    if (!turfName) return;

    const fetchBookings = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bookings?name=${encodeURIComponent(turfName)}`);
        const data = await response.json();
        const currentDate = new Date().toISOString().split('T')[0];
        const filteredBookings = data.filter(booking => booking.date >= currentDate);
        setBookings(filteredBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, [turfName]);

  const handleCancelBooking = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setBookings(bookings.filter(booking => booking._id !== id));
        alert('Booking canceled successfully');
      } else {
        alert('Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
    }
  };

  const handleSaveTimings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/turfTimings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': localStorage.getItem('loggedInUserEmail'),  
        },
        body: JSON.stringify({
          turfName,
          openingTime,
          closingTime,
        }),
      });

      if (response.ok) {
        alert('Timings saved successfully');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to save timings');
      }
    } catch (error) {
      console.error('Error saving timings:', error);
    }
  };

  const handleSaveDays = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/turfTimings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': localStorage.getItem('loggedInUserEmail'),  
        },
        body: JSON.stringify({
          turfName,
          days_available: selectedDays,
        }),
      });

      if (response.ok) {
        alert('Days available updated successfully');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update days available');
      }
    } catch (error) {
      console.error('Error saving days available:', error);
    }
  };

  const toggleDaySelection = (day) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  return (
    <div className="min-h-screen bg-white-500 py-12 flex justify-center items-center relative">
    <div className="container mx-auto px-6 max-w-4xl">
      {/* Logo at the top left */}
      <h1
        className="text-4xl font-extrabold text-green-500 relative mr-4"
        style={{
          textShadow: '2px 2px 4px #000',
          fontFamily: '"Bebas Neue", cursive',
          position: 'absolute',
          top: '10px',
          left: '10px',
        }}
      >
        Sp
        <span style={{ display: 'inline-block', position: 'relative' }}>
          <span style={{ visibility: 'hidden' }}>O</span>
          <span
            role="img"
            aria-label="football"
            style={{
              position: 'absolute',
              top: '2px',
              left: '0px',
              fontSize: '0.75em',
            }}
          >
            ⚽
          </span>
        </span>
        <span style={{ marginLeft: '5px' }}>rtsHub</span>
      </h1>

        <h1 className="text-4xl font-bold text-center text-blue-700 mb-10">Your Dashboard</h1>

        {turfName ? (
          <>
            <section className="bg-white rounded-lg shadow-lg p-6 mb-8 text-center">
             <h2 className="text-3xl font-semibold text-blue-600 italic">Welcome, {turfName} Owner</h2>
            </section>

            {/* Display upcoming bookings */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-blue-600 mb-6">
                Upcoming Bookings for {turfName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {bookings.length > 0 ? (
                  bookings.map(booking => (
                    <div key={booking._id} className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
                      <p className="text-gray-700">
                        <strong>Date:</strong> {booking.date}
                      </p>
                      <p className="text-gray-700">
                        <strong>Time:</strong> {booking.time}
                      </p>
                      <p className="text-gray-700">
                        <strong>Duration:</strong> {booking.duration} hour(s)
                      </p>
                      <p className="text-gray-700">
                        <strong>Sport:</strong> {booking.sport}
                      </p>
                      <p className="text-gray-700">
                        <strong>User Email:</strong> {booking.userEmail}
                      </p>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded mt-4 w-full"
                        onClick={() => handleCancelBooking(booking._id)}
                      >
                        Cancel Booking
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No upcoming bookings.</p>
                )}
              </div>
            </section>

            <section className="bg-white border-2 border-green-500 rounded-lg shadow-lg p-6 mb-8 text-center">
              <h2 className="text-2xl font-semibold text-blue-600 mb-6">Set Turf Timings</h2>
              <div className="flex justify-center space-x-4 mb-4">
                <input type="time" value={openingTime} onChange={(e) => setOpeningTime(e.target.value)} className="p-3 border rounded-lg w-40" />
                <input type="time" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} className="p-3 border rounded-lg w-40" />
              </div>
              <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg" onClick={handleSaveTimings}>Save Timings</button>
            </section>

            <section className="bg-white border-2 border-green-500 rounded-lg shadow-lg p-6 text-center">
              <h2 className="text-2xl font-semibold text-blue-600 mb-6">Set Days Available</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {daysOfWeek.map(day => (
                  <label
                    key={day}
                    className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${
                      selectedDays.includes(day) ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-blue-200"
                    }`}
                    onClick={() => toggleDaySelection(day)}
                  >
                    <input type="checkbox" checked={selectedDays.includes(day)} onChange={() => toggleDaySelection(day)} className="hidden" />
                    {day}
                  </label>
                ))}
              </div>
              <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg" onClick={handleSaveDays}>
                Save Days
              </button>
            </section>
          </>
        ) : (
          <p className="text-center text-gray-500 italic">Loading your turf dashboard...</p>
        )}
      </div>
    </div>
  );
};




export default TurfOwnerDashboard;