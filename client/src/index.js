// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();





// import React from 'react';
// import ReactDOM from 'react-dom/client'; // Use this for React 18
// import { BrowserRouter as Router } from 'react-router-dom'; // Import Router
// import App from './App';
// import './index.css'; // Import your CSS here (make sure this file contains your styles)

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <Router>
//     <App />
//   </Router>
// );




import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Auth0Provider
    domain="dev-ys1y60diwn6tzagb.us.auth0.com"
    clientId="vJYbGjqNzcHX6m7CbVdAwrnGTW2p28w8"
    redirectUri={window.location.origin}
  >
    <Router>
      <App />
    </Router>
  </Auth0Provider>
);
