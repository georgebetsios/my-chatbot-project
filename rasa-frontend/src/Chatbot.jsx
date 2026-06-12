import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css'; // Για να του δώσουμε ωραίο στυλ
import logoImg from './assets/logo-master.jpg';
import ReactMarkdown from 'react-markdown';

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

  // Κοινό sender_id για να κρατάει το ίδιο session η Rasa στην ίδια συνομιλία
  const SENDER_ID = "react_user_session";

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
        body: JSON.stringify({ sender: SENDER_ID, message: input }),
      });

      const data = await response.json();

      // Αν το Rasa απαντήσει, πρόσθεσε τα μηνύματα ΚΑΙ τα κουμπιά τους
      if (data && data.length > 0) {
        data.forEach((msg) => {
          setMessages((prev) => [...prev, {
            text: msg.text || "Δεν επιστράφηκε κείμενο.",
            sender: "bot",
            buttons: msg.buttons || [] // 👈 Εδώ αποθηκεύουμε τα buttons που στέλνει η Rasa
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

  const handleButtonClick = async (buttonTitle, buttonPayload) => {
    // 1. Εμφανίζουμε το κείμενο του κουμπιού σαν μήνυμα του χρήστη στο chat
    setMessages(prev => [...prev, { text: buttonTitle, sender: 'user' }]);

    try {
      // 2. Στέλνουμε το κρυφό payload (π.χ. /affirm_el) στη Rasa χρησιμοποιώντας fetch
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
            buttons: reply.buttons || [] // Κρατάμε τα επόμενα buttons αν υπάρχουν
          }]);
        });
      }
    } catch (error) {
      console.error("Error sending button payload:", error);
      setMessages(prev => [...prev, { text: "Σφάλμα κατά την επεξεργασία του κουμπιού.", sender: "bot" }]);
    }
  };

  // 🌟 Συνάρτηση που επιστρέφει το κατάλληλο SVG ανάλογα με το payload ή τον τίτλο
  const getButtonIcon = (payload) => {
    // Αν το payload περιέχει affirm (δηλαδή είναι "Ναι")
    if (payload.includes('affirm')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg"
          width="16" /* 👈 Το μικραίνουμε ελάχιστα για να κάθεται κομψά στο κουμπί */
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5" /* 👈 camelCase */
          strokeLinecap="round" /* 👈 camelCase */
          strokeLinejoin="round" /* 👈 camelCase */
          className="btn-svg-icon">
          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
          <path d="M7 10v12" />
        </svg>
      );
    }

    // Αν το payload περιέχει deny (δηλαδή είναι "Όχι")
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
      {/* Κουμπί Launcher */}
      <button className="chatbot-launcher" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          /* ✖️ Μοντέρνο minimal X για το κλείσιμο */
          <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <>
            {/* Το κείμενο στα αριστερά */}
            <span className="launcher-tooltip">Ρωτήστε μας!</span>

            {/* 💬 Premium SVG Chat Icon */}
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
              /* 1. Ο γονέας (Container) που ελέγχει αν το πακέτο πάει αριστερά ή δεξιά */
              <div key={index} className={`message-container ${msg.sender}`}>

                {/* 2. Το ίδιο το συννεφάκι (Bubble) που παίρνει το χρώμα */}
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

                {/* 3. Τα κουμπιά κάτω από το bubble, μόνο αν είναι bot και έχει κουμπιά */}
                {msg.sender === 'bot' && msg.buttons && msg.buttons.length > 0 && (
                  <div className="chat-buttons-container">
                    {msg.buttons.map((btn, bIndex) => (
                      <button
                        key={bIndex}
                        className="chat-action-button"
                        onClick={() => handleButtonClick(btn.title, btn.payload)}
                      >
                        {/* 🌟 ΕΔΩ ΜΠΑΙΝΕΙ ΤΟ SVG ΕΙΚΟΝΙΔΙΟ */}
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