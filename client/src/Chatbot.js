import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react'; // Import Auth0 hooks

const Chatbot = () => {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const { user, isAuthenticated } = useAuth0(); // Access user and authentication state

  // Function to send the user's email to the FastAPI server
  const sendEmailToServer = async (email) => {
    try {
      const response = await fetch('http://localhost:8000/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email to server');
      }
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  // Function to toggle the visibility of the chatbot
  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);

    // Send email to server when the chat is opened
    if (!isChatVisible && isAuthenticated) {
      sendEmailToServer(user.email);
    }
  };

  return (
    <div>
      {/* Chat Icon Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 p-3 bg-green-500 rounded-full shadow-lg z-50 flex items-center justify-center"
        style={{ fontSize: '24px' }}
      >
        💬
      </button>

      {/* Chatbot Iframe */}
      {isChatVisible && (
        <div className="fixed bottom-0 right-0 m-4 p-4 bg-white rounded-lg shadow-lg z-50">
          <iframe
            width="350"
            height="430"
            allow="microphone;"
            src="https://console.dialogflow.com/api-client/demo/embedded/10442538-583a-4031-99cd-bce72f17fceb"
            title="Dialogflow Chatbot"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default Chatbot;