import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div>
      <header className="bg-blue-500 p-4 text-white">
        <h1 className="text-3xl">Welcome to SportsHub</h1>
        <nav>
          <Link to="/" className="text-white hover:underline mr-4">Home</Link>
          {/* Add other navigation links as needed */}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="bg-blue-500 p-4 text-white text-center">
        © 2024 SportsHub. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
