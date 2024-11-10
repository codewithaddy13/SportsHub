import logo from './logo.svg';
import './App.css';






// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import TurfBookingSystem from './TurfBookingSystem';  // Assuming this is your home component
// import TurfBookingPage from './TurfBookingPage';      // Import the booking page component

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<TurfBookingSystem />} />
//         <Route path="/book/:id" element={<TurfBookingPage />} />  {/* Dynamic route with id */}
//       </Routes>
//     </Router>
//   );
// }

// export default App;



// import React from 'react';
// import { Routes, Route } from 'react-router-dom';
// import TurfBookingSystem from './TurfBookingSystem'; // Adjust according to your structure
// import TurfBookingPage from './TurfBookingPage'; // Adjust according to your structure

// const App = () => {
//   return (
//     <Routes>
//       <Route path="/" element={<TurfBookingSystem />} />
//       <Route path="/booking/:id" element={<TurfBookingPage />} />
//     </Routes>
//   );
// };

// export default App;





// import React from 'react';
// import { Route, Routes } from 'react-router-dom';
// import TurfBookingSystem from './TurfBookingSystem';  // Home component
// import TurfBookingPage from './TurfBookingPage';      // Booking page component

// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<TurfBookingSystem />} />
//       <Route path="/book/:id" element={<TurfBookingPage />} />  {/* Dynamic route with id */}
//     </Routes>
//   );
// }

// export default App;




import React from 'react';
import { Route, Routes } from 'react-router-dom';
import TurfBookingSystem from './TurfBookingSystem';   // Home component
import TurfBookingPage from './TurfBookingPage';       // Booking page component
import AnalyticsDashboard from './AnalyticsDashboard'; // Analytics component

function App() {
  return (
    <Routes>
      <Route path="/" element={<TurfBookingSystem />} />
      <Route path="/book/:id" element={<TurfBookingPage />} />  {/* Dynamic route with id */}
      <Route path="/analytics" element={<AnalyticsDashboard />} /> {/* Analytics Dashboard route */}
    </Routes>
  );
}

export default App;













