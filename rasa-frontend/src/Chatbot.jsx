import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css'; 
import logoImg from './assets/logo-master.jpg';
import ReactMarkdown from 'react-markdown';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { text: "Γεια σας! Είμαι ο ψηφιακός βοηθός του ΠΜΣ. Πώς μπορώ να σας βοηθήσω σήμερα;", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom whenever a new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Unique session ID to maintain a consistent conversation context in Rasa
  const SENDER_ID = "react_user_session";

  // Handles sending text messages manually typed by the user
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      // Connect to the Rasa REST API endpoint
      const response = await fetch("http://localhost:5005/webhooks/rest/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: SENDER_ID, message: input }),
      });

      const data = await response.json();

      // Parse Rasa responses and store text along with any attached buttons
      if (data && data.length > 0) {
        data.forEach((msg) => {
          setMessages((prev) => [...prev, {
            text: msg.text || "Δεν επιστράφηκε κείμενο.",
            sender: "bot",
            buttons: msg.buttons || [] 
          }]);
        });
      } else {
        setMessages((prev) => [...prev, { text: "Δεν έλαβα απάντηση από το σύστημα.", sender: "bot" }]);
      }
    } catch (error) {
      console.error("Error communicating with Rasa:", error);
      setMessages((prev) => [...prev, { text: "Σφάλμα σύνδεσης με τον server.", sender: "bot" }]);
    }
  };

  // Handles quick-reply button clicks by displaying the title and passing the hidden payload to Rasa
  const handleButtonClick = async (buttonTitle, buttonPayload) => {
    setMessages(prev => [...prev, { text: buttonTitle, sender: 'user' }]);

    try {
      const response = await fetch("http://localhost:5005/webhooks/rest/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: SENDER_ID, message: buttonPayload }),
      });

      const data = await response.json();

      if (data && data.length > 0) {
        data.forEach(reply => {
          setMessages(prev => [...prev, {
            text: reply.text || "",
            sender: 'bot',
            buttons: reply.buttons || [] 
          }]);
        });
      }
    } catch (error) {
      console.error("Error sending button payload:", error);
      setMessages(prev => [...prev, { text: "Σφάλμα κατά την επεξεργασία του κουμπιού.", sender: "bot" }]);
    }
  };

  // Returns the appropriate SVG icon based on the button's payload intent
  const getButtonIcon = (payload) => {
    if (payload.includes('affirm')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg"
          width="16" 
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="btn-svg-icon">
          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
          <path d="M7 10v12" />
        </svg>
      );
    }

    if (payload.includes('deny')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="btn-svg-icon">
          <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
          <path d="M17 14V2" />
        </svg>
      );
    }

    return null;
  };

  return (
    <div className="chatbot-wrapper">
      {/* Widget Toggle Launcher Button */}
      <button className="chatbot-launcher" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <>
            <span className="launcher-tooltip">Ρωτήστε μας!</span>
            <svg xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-message-circle-more-icon">
              <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
              <path d="M8 12h.01" />
              <path d="M12 12h.01" />
              <path d="M16 12h.01" />
            </svg>
          </>
        )}
      </button>

      {/* Main Chat Interface Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <img src={logoImg} alt="Logo" className="chatbot-header-logo" />
            <div className="chatbot-header-title">
              <h3>Ψηφιακός Βοηθός ΠΜΣ</h3>
              <span className="chatbot-online-status">Online</span>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-container ${msg.sender}`}>
                
                {/* Dynamically render bot responses with Markdown, specifically handling target="_blank" links */}
                <div className={`message-bubble ${msg.sender}`}>
                  {msg.sender === 'bot' ? (
                    <ReactMarkdown
                      components={{
                        a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>

                {/* Render quick-reply interactive option buttons below the message bubble */}
                {msg.sender === 'bot' && msg.buttons && msg.buttons.length > 0 && (
                  <div className="chat-buttons-container">
                    {msg.buttons.map((btn, bIndex) => (
                      <button
                        key={bIndex}
                        className="chat-action-button"
                        onClick={() => handleButtonClick(btn.title, btn.payload)}
                      >
                        {getButtonIcon(btn.payload)}
                        <span>{btn.title}</span>
                      </button>
                    ))}
                  </div>
                )}

              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-form" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Γράψτε ένα μήνυμα..."
            />
            <button type="submit" aria-label="Αποστολή">➤</button>
          </form>
        </div>
      )}
    </div>
  );
}