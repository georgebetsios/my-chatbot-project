import React from 'react';
import Chatbot from './Chatbot'; 
import bgImage from './assets/background.png';

function App() {
  return (
    <div style={{
      backgroundImage: `url(${bgImage})`,
      backgroundSize: '100% 100%', // Τεντώνει την εικόνα για να πιάσει όλη την οθόνη
      backgroundPosition: 'top left',
      backgroundRepeat: 'no-repeat',
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>
      
      {/* Κρατάς ΜΟΝΟ αυτό. Το bot θα κάτσει αυτόματα πάνω δεξιά/κάτω δεξιά όπως ορίζει το CSS του */}
      <Chatbot /> 
      
    </div>
  );
}

export default App;