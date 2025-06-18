import logo from './logo.svg';
import './App.css'
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import TurfBookingSystem from './TurfBookingSystem';   // Home component
import TurfBookingPage from './TurfBookingPage';       // Booking page component
import AnalyticsDashboard from './AnalyticsDashboard'; // Analytics component
import TurfOwnerDashboard from './TurfOwnerDashboard'; // Owner dashboard component

function App() {
  return (
    <Routes>
      <Route path="/" element={<TurfBookingSystem />} />
      <Route path="/book/:id" element={<TurfBookingPage />} />  {/* Dynamic route with id */}
      <Route path="/analytics" element={<AnalyticsDashboard />} /> {/* Analytics Dashboard route */}
      <Route path="/dashboard" element={<TurfOwnerDashboard />} /> {/* Turf owner dashboard */}
    </Routes>
  );
}

export default App;













