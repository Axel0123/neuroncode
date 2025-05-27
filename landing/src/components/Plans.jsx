import React from 'react';

function Plans() {
  return (
    <section id="plans" className="py-16 px-6 bg-gray-900">
      <h2 className="text-3xl font-semibold text-center mb-10">Choose Your Plan</h2>
      <div className="grid md:grid-cols-2 gap-8 text-center">
        <div className="border border-gray-700 p-6 rounded">
          <h3 className="text-2xl font-bold mb-2">Free</h3>
          <p className="mb-4">Basic editor, limited daily usage</p>
          <p className="text-4xl font-bold mb-4">$0</p>
          <button className="bg-gray-700 text-white px-6 py-2 rounded hover:bg-gray-600">Get Started</button>
        </div>
        <div className="border border-blue-600 p-6 rounded bg-blue-900">
          <h3 className="text-2xl font-bold mb-2">Pro</h3>
          <p className="mb-4">Unlimited access, advanced tools & automation</p>
          <p className="text-4xl font-bold mb-4">$9/mo</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Subscribe</button>
        </div>
      </div>
    </section>
  );
}

export default Plans;