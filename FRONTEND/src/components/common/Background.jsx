// src/components/Background.jsx
import React from 'react';

const Background = () => {
  return (
    <div className="fixed inset-0 z-0">
      {/* Background Image */}
      <img 
        src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80"
        alt="Background"
        className="w-full h-full object-cover"
      />
      
      {/* Blur Overlays */}
      <div className="absolute inset-0 backdrop-blur-2xl bg-black/40"></div>
      <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-b from-purple-900/30 to-black/60"></div>
      
      {/* Animated Blobs */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-[-40px] left-[-40px] w-80 h-80 bg-blue-500 rounded-full filter blur-[60px] animate-blob"></div>
        <div className="absolute top-[40px] right-[-40px] w-80 h-80 bg-purple-500 rounded-full filter blur-[60px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-40px] left-[20px] w-80 h-80 bg-pink-500 rounded-full filter blur-[60px] animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
};

export default Background;