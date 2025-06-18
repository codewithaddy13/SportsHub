import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Chatbot = () => {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const { user, isAuthenticated } = useAuth0();

  // Function to send the user's email to the FastAPI server
  const sendEmailToServer = async (email) => {
    try {
      const response = await fetch('http://localhost:8000/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('Failed to send email');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  // Toggle chat visibility
  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
    if (!isChatVisible && isAuthenticated) {
      sendEmailToServer(user.email);
    }
  };

  // Close the chat widget
  const closeChat = () => {
    setIsChatVisible(false);
    // Optional: Minimize the messenger instead of hiding
    const dfMessenger = document.querySelector('df-messenger');
    if (dfMessenger) {
      dfMessenger.minimize = true; // Minimizes if you prefer this over hiding
    }
  };

  // Load Dialogflow Messenger script dynamically
  useEffect(() => {
    if (isChatVisible) {
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isChatVisible]);

  return (
    <div>
      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 p-3 bg-green-500 rounded-full shadow-lg z-50 flex items-center justify-center"
        style={{ fontSize: '24px' }}
      >
        {isChatVisible ? '✕' : '💬'}
      </button>

      {/* Dialogflow Messenger with Close Button */}
      {isChatVisible && (
        <div className="fixed bottom-20 right-4 z-50">
          <div className="relative">
            {/* Close Button (top-right corner of the chat) */}
            <button
              onClick={closeChat}
              className="absolute -top-8 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 z-50"
              style={{ width: '28px', height: '28px' }}
            >
              ✕
            </button>
            <df-messenger
              chat-title="TurfBuddy"
              agent-id="10442538-583a-4031-99cd-bce72f17fceb"
              language-code="en"
              width="350"
              height="500"
            ></df-messenger>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
