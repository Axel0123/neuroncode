import React from 'react';

function Hero() {
  return (
    <section className="text-center py-20 px-4 bg-gradient-to-r from-blue-800 to-indigo-900">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to CodePulse</h1>
      <p className="text-xl md:text-2xl mb-8">Execute, automate, and visualize Python code in real-time from anywhere.</p>
      <a href="#plans" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded text-white text-lg transition">Try it Free</a>
    </section>
  );
}

export default Hero;