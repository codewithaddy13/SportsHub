import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Chatbot from './Chatbot';

const Turf = ({ name, price, image, description, onClick, rank }) => {
  const medalEmojis = {
    1: '🥇', // Gold medal for rank 1
    2: '🥈', // Silver medal for rank 2
    3: '🥉', // Bronze medal for rank 3
  };

  return (
    <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300 relative">
      {rank <= 3 && (
        <span className="absolute top-4 left-4 text-3xl">
          {medalEmojis[rank]}
        </span>
      )}
      <img src={`http://localhost:5000${image}`} alt={name} className="h-48 w-full object-cover rounded-lg" />
      <h2 className="text-lg font-bold mt-4">{name}</h2>
      <p className="text-gray-800">${price}/hour</p>
      <p className="text-gray-800">{description}</p>
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
        onClick={onClick}
      >
        Book Now
      </button>
    </div>
  );
};

const Navbar = ({ onSearch, onAnalyticsClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('Pune'); // Default city is Pune
  const [isTurfOwner, setIsTurfOwner] = useState(false);
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const areaName = data.address?.suburb || data.address?.city || 'Unknown Area';
            setLocation(areaName);
          } catch (error) {
            console.error('Error fetching location name:', error);
            alert('Unable to fetch location. Please try again.');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to fetch location. Please allow location access.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleLogout = async () => {
    try {
      // Call the Node.js logout endpoint
      const response = await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Logout successful and user email cleared in FastAPI');
        // Trigger Auth0 logout
        logout({ returnTo: window.location.origin });
      } else {
        console.error('Failed to clear user email');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  

  useEffect(() => {
    const checkTurfOwner = async () => {
      if (isAuthenticated && user?.email) {
        try {
          localStorage.setItem('loggedInUserEmail', user.email);
          console.log('Logged-in user email:', localStorage.getItem('loggedInUserEmail'));
          const response = await fetch('http://localhost:5000/api/check-turfowner', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: user.email }),
          });
          const data = await response.json();
          setIsTurfOwner(data.isTurfOwner); // Assume the response returns { isTurfOwner: true/false }
          console.log('API Response:', data);
        } catch (error) {
          console.error('Error checking turf owner status:', error);
        }
      }
    };

    checkTurfOwner();
  }, [isAuthenticated, user]);
  


  

  return (
    <nav className="bg-green-500 text-white p-4 flex justify-between items-center fixed top-0 left-0 w-full z-10 shadow-md">
      <div className="flex items-center">
        <h1
          className="text-3xl font-extrabold text-center text-white relative mr-4"
          style={{
            textShadow: '2px 2px 4px #000',
            fontFamily: '"Bebas Neue", cursive',
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

        <div
          onClick={fetchLocation}
          className="bg-green-700 text-white p-2 rounded cursor-pointer flex items-center ml-4"
        >
          <span role="img" aria-label="location" className="mr-2">
            📍
          </span>
          <span>{location}</span>
        </div>
      </div>

      <div className="flex items-center">
        <form onSubmit={handleSearch}>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search turfs"
            className="p-2 rounded-l text-black bg-white"
          />
          <button type="submit" className="bg-green-700 text-white p-2 rounded-r">
            Search
          </button>
        </form>

        {!isAuthenticated ? (
          <button
            onClick={() => loginWithRedirect()}
            className="bg-green-700 text-white p-2 rounded ml-4"
          >
            Login
          </button>
        ) : (
          <>
            <div className="flex items-center ml-4">
              <span role="img" aria-label="person" className="mr-2">👤</span>
              <img src={user.picture} alt={user.name} className="h-8 w-8 rounded-full mr-2" />
              <span>{user.name}</span>
            </div>
            {/* <button
              onClick={() => logout({ returnTo: window.location.origin })}
              className="bg-red-500 text-white p-2 rounded ml-4"
            >
              Logout
            </button> */}
            <button
              onClick={async () => {
              // Call the existing logout function
              logout({ returnTo: window.location.origin });
              // Call the new handleLogout function
              await handleLogout();
             }}
              className="bg-red-500 text-white p-2 rounded ml-4"
            >
              Logout
            </button>
            {/* <button
              onClick={onAnalyticsClick}
              className="bg-blue-500 text-white p-2 rounded ml-4"
            >
              Analytics
            </button> */}
            {isTurfOwner && (
              <button
                onClick={onAnalyticsClick}
                className="bg-blue-700 text-white p-2 rounded ml-4"
              >
                Analytics
              </button>
            )}
            {isTurfOwner && (
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-yellow-400 text-green-600 p-2 rounded ml-4"
              >
                Manage My Turf
              </button>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-green-500 text-white p-8 flex justify-around items-center">
    <div className="flex flex-col items-center">
      <h1
        className="text-3xl font-extrabold text-center text-white"
        style={{ fontFamily: '"Bebas Neue", cursive', textShadow: '2px 2px 4px #000' }}
      >
        Sp⚽rtsHub
      </h1>
      <p className="text-center">Your Game, Your Turf - Anytime, Anywhere!</p>
    </div>
    <div>
      <h2 className="text-lg font-bold mb-2">Contact Us</h2>
      <p>Email: sportshubturfs@gmail.com</p>
      <p>Phone: +91 9067044072</p>
    </div>
    

<div>
  <h2 className="text-lg font-bold mb-2">Follow Us</h2>
  <div className="flex space-x-4">
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" // Facebook logo
      alt="Facebook"
      className="h-6 w-6" // Size of the logo
    />
    <img
      src="https://cdn.prod.website-files.com/5d66bdc65e51a0d114d15891/64cebc6c19c2fe31de94c78e_X-vector-logo-download.png" // Twitter logo
      alt="Twitter"
      className="h-6 w-6 rounded-full" // Size of the logo
    />
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" // Instagram logo
      alt="Instagram"
      className="h-6 w-6 rounded-full" // Size of the logo
    />
  </div>
</div>
<div>
  <h2 className="text-lg font-bold mb-2">FAQs</h2>
  <p>Help & Support</p>
  <p>Terms of Service</p>
</div>

  </footer>
);

const TurfBookingSystem = () => {
  const [turfs, setTurfs] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTurfsAndAnalytics = async () => {
      try {
        const [turfsResponse, analyticsResponse] = await Promise.all([
          fetch('http://localhost:5000/api/turfs'),
          fetch('http://localhost:5000/api/analysis')
        ]);

        if (!turfsResponse.ok || !analyticsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [turfsData, analysisData] = await Promise.all([
          turfsResponse.json(),
          analyticsResponse.json()
        ]);

        setTurfs(turfsData);
        setAnalysisData(analysisData);
      } catch (error) {
        console.error('Error fetching turfs or analysis data:', error);
      }
    };

    fetchTurfsAndAnalytics();
  }, []);

  const handleSearch = (term) => {
    const foundTurf = turfs.find((turf) => turf.name.toLowerCase() === term.toLowerCase());
    if (foundTurf) {
      navigate(`/book/${foundTurf._id}`);
    } else {
      alert("Turf not found. Please check the name and try again.");
    }
  };

  const handleBookNow = (turf) => {
    navigate(`/book/${turf._id}`);
  };

  const handleAnalyticsClick = () => {
    navigate('/analytics');
  };

  const rankedTurfs = turfs.map((turf) => ({
    ...turf,
    analyticsScore:
      analysisData?.popularTurfs.find((popTurf) => popTurf.name === turf.name)?.count || 0
  }));

  return (
    <div>
      <Navbar onSearch={handleSearch} onAnalyticsClick={handleAnalyticsClick} />
      <div
        className="container mx-auto p-4 pt-24"
        style={{
          backgroundImage: "url('https://png.pngtree.com/thumb_back/fw800/background/20240525/pngtree-artificial-turf-background-image_15730760.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
        }}
      >
        {/* <h2 className="text-4xl font-bold text-center text-white">Your Game, Your Turf - Anytime, Anywhere!</h2>
        <p className="text-center text-white text-lg mb-8">Choose your turf and book online!</p> */}

        <h2 className="text-4xl font-bold text-center text-yellow-400"
          style=
          {{
           fontFamily: 'cursive',
           color: '#FFD700',
           textShadow: '2px 2px 5px rgba(0, 0, 0, 0.7)',
          }}
        >
        Your Game, Your Turf - Anytime, Anywhere!
        </h2>
        <p className="text-center text-yellow-300 text-lg mb-8"
         style=
         {{
            fontFamily: 'cursive',
            color: '#FFD700',
            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
          }}
        >
        Choose your turf and book online!
        </p>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {rankedTurfs
            .sort((a, b) => b.analyticsScore - a.analyticsScore)
            .map((turf, index) => (
              <Turf
                key={turf._id}
                name={turf.name}
                price={turf.price}
                image={turf.image}
                description={turf.description}
                onClick={() => handleBookNow(turf)}
                rank={index + 1}
              />
            ))}
        </div>
      </div>
      <Footer />
      <Chatbot /> {/* Integrate the Chatbot here */}
    </div>
  );
};

export default TurfBookingSystem;
