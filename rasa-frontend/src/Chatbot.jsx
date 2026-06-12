import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css'; // Για να του δώσουμε ωραίο στυλ
import logoImg from './assets/logo-master.jpg';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { text: "Γεια σας! Είμαι ο ψηφιακός βοηθός του ΠΜΣ. Πώς μπορώ να σας βοηθήσω σήμερα;", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Αυτόματο scroll προς τα κάτω σε κάθε νέο μήνυμα
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      // Σύνδεση με το REST endpoint του Rasa
      const response = await fetch("http://localhost:5005/webhooks/rest/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "react_user", message: input }),
      });

      const data = await response.json();

      // Αν το Rasa απαντήσει, πρόσθεσε τα μηνύματα
      if (data && data.length > 0) {
        data.forEach((msg) => {
          if (msg.text) {
            setMessages((prev) => [...prev, { text: msg.text, sender: "bot" }]);
          }
        });
      } else {
        setMessages((prev) => [...prev, { text: "Δεν έλαβα απάντηση από το σύστημα.", sender: "bot" }]);
      }
    } catch (error) {
      console.error("Error communicating with Rasa:", error);
      setMessages((prev) => [...prev, { text: "Σφάλμα σύνδεσης με τον server.", sender: "bot" }]);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {/* Κουμπί Launcher */}
      <button className="chatbot-launcher" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          /* ✖️ Μοντέρνο minimal X για το κλείσιμο */
          <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <>
            {/* Το κείμενο στα αριστερά */}
            <span className="launcher-tooltip">Ρωτήστε μας!</span>

            {/* 💬 Premium SVG Chat Icon (Minimal & Καθαρό) */}
            <svg xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              class="lucide lucide-message-circle-more-icon lucide-message-circle-more">
              <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
              <path d="M8 12h.01" />
              <path d="M12 12h.01" />
              <path d="M16 12h.01" />
            </svg>           </>
        )}
      </button>

      {/* Παράθυρο Chat */}
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
              <div key={index} className={`message-bubble ${msg.sender}`}>
                {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
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