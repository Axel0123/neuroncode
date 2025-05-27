import React from 'react';
import Hero from './components/Hero';
import Features from './components/Features';
import Plans from './components/Plans';
import CTA from './components/CTA';

function App() {
  return (
    <div className="font-sans text-white bg-gray-900">
      <Hero />
      <Features />
      <Plans />
      <CTA />
    </div>
  );
}

export default App;