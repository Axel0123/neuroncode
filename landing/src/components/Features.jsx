import React from 'react';

function Features() {
  return (
    <section className="py-16 px-6 bg-gray-800">
      <h2 className="text-3xl font-semibold text-center mb-10">What You Can Do</h2>
      <div className="grid md:grid-cols-3 gap-8 text-center">
        <div><h3 className="text-xl font-bold mb-2">Run Python Instantly</h3><p>Write and execute Python code in your browser.</p></div>
        <div><h3 className="text-xl font-bold mb-2">Automate Tasks</h3><p>Use natural language to trigger code-based actions.</p></div>
        <div><h3 className="text-xl font-bold mb-2">Generate Visuals</h3><p>Create logos, charts, and videos from simple prompts.</p></div>
      </div>
    </section>
  );
}

export default Features;