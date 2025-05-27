import React from 'react';

function CodeEditor({ code, setCode }) {
  return (
    <textarea
      value={code}
      onChange={(e) => setCode(e.target.value)}
      rows={10}
      className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
      placeholder="Write your Python code here..."
    />
  );
}

export default CodeEditor;