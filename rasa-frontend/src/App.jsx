import React from 'react';
import Chatbot from './Chatbot'; 
import bgImage from './assets/background.png';

function App() {
  return (
    <div style={{
      backgroundImage: `url(${bgImage})`,
      backgroundSize: '100% 100%', 
      backgroundPosition: 'top left',
      backgroundRepeat: 'no-repeat',
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>
      
      <Chatbot /> 
      
    </div>
  );
}

export default App;