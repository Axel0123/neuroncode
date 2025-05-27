import React from 'react';

function OutputConsole({ output, error }) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Output:</h2>
      <pre className="bg-gray-800 p-4 rounded text-green-400">{output || "No output"}</pre>
      {error && (
        <>
          <h2 className="text-xl font-semibold mt-4 text-red-400">Error:</h2>
          <pre className="bg-gray-800 p-4 rounded text-red-400">{error}</pre>
        </>
      )}
    </div>
  );
}

export default OutputConsole;