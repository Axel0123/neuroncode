import React, { useState } from 'react';
import * as QRCodeReact from 'qrcode.react';
const QRCode = QRCodeReact.default || QRCodeReact;

export default function Editor() {
  const [code, setCode] = useState(() => {
    const stored = localStorage.getItem("codeToRun");
    localStorage.removeItem("codeToRun");
    return stored || '';
  });

  const [output, setOutput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [lastCode, setLastCode] = useState('');
  const [usedSuggestions, setUsedSuggestions] = useState(new Set());
  const [shareLink, setShareLink] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);

  const handleRunCode = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setOutput("Error: Debes iniciar sesión para ejecutar código.");
      return;
    }

    try {
      const response = await fetch('https://neuroncode.onrender.com/run-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      setOutput(data.output || 'No output');
      setSuggestions(data.suggestions || []);
      setUsedSuggestions(new Set());

      await fetch('https://neuroncode.onrender.com/save-execution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code, output: data.output || 'No output' })
      });

    } catch (error) {
      setOutput(`Error: ${error.message}`);
      setSuggestions([]);
    }
  };

  const aplicarSugerencia = (texto) => {
    if (usedSuggestions.has(texto)) return;

    let nuevoCodigo = code;
    let aplicado = false;
    setLastCode(code);

    if (texto.includes("list comprehensions")) {
      const regex = /squares\s*=\s*\[\]\s*for i in range\((\d+)\):\s*squares\.append\(i \* i\)/s;
      const match = code.match(regex);
      if (match) {
        const n = match[1];
        nuevoCodigo = `squares = [i * i for i in range(${n})]\nprint(squares)`;
        aplicado = true;
      }
    } else if (texto.includes("eval()")) {
      if (code.includes("eval(")) {
        nuevoCodigo = code.replace(/eval\((.*?)\)/g, "ast.literal_eval($1)");
        if (!code.includes("import ast")) {
          nuevoCodigo = "import ast\n" + nuevoCodigo;
        }
        aplicado = true;
      }
    } else if (texto.includes("Variables no utilizadas")) {
      const lines = code.split("\n");
      const assigned = lines.filter(l => l.includes("=") && !l.includes("=="));
      const result = assigned.filter(l => {
        const varName = l.split("=")[0].trim();
        return code.split(varName).length <= 2;
      });
      nuevoCodigo = lines.filter(line => !result.includes(line)).join("\n");
      aplicado = true;
    } else if (texto.includes("funciones relacionadas en una clase")) {
      const lines = code.split("\n");
      const funciones = lines.filter(l => l.trim().startsWith("def "));
      if (funciones.length > 1) {
        nuevoCodigo = "class MisFunciones:\n";
        lines.forEach(line => {
          if (line.trim().startsWith("def ")) {
            nuevoCodigo += "    @staticmethod\n    " + line + "\n";
          } else if (line.trim()) {
            nuevoCodigo += "    " + line + "\n";
          }
        });
        nuevoCodigo += "\nprint(MisFunciones.sumar(5,3))";
        aplicado = true;
      }
    }

    if (aplicado) {
      setCode(nuevoCodigo);
      setUsedSuggestions(prev => new Set(prev).add(texto));
    }
  };

  const deshacerCambio = () => {
    if (lastCode) {
      setCode(lastCode);
      setUsedSuggestions(new Set());
    }
  };

  const handleShare = async () => {
    const response = await fetch('https://neuroncode.onrender.com/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, output })
    });
    const data = await response.json();
    setShareLink(data.url);
    setShowQR(true);
  };

  const copiarTexto = (texto) => {
    navigator.clipboard.writeText(texto);
    alert("📋 Copiado al portapapeles.");
  };

  const handleExplain = async () => {
    setIsExplaining(true);
    const response = await fetch('https://neuroncode.onrender.com/explain-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const data = await response.json();
    setExplanation(data.explanation);
    setIsExplaining(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl space-y-6 animate-fade-in">
        <h1 className="text-4xl font-bold text-center text-white tracking-wide">
          <span className="text-blue-400">CodePulse</span> – Run Python in Real Time
        </h1>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Write your Python code here..."
          className="w-full h-64 p-4 rounded-xl bg-[#1e293b] text-green-300 font-mono text-base border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        />

        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={handleRunCode} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-transform hover:scale-105">
            Run Code
          </button>

          <button onClick={deshacerCambio} className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-transform hover:scale-105" disabled={!lastCode}>
            Deshacer
          </button>

          <button onClick={handleShare} className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-transform hover:scale-105">
            Compartir
          </button>

          <button onClick={() => copiarTexto(code)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-transform hover:scale-105">
            Copiar Código
          </button>

          <button onClick={() => copiarTexto(output)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-transform hover:scale-105">
            Copiar Salida
          </button>

          <button onClick={handleExplain} className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-transform hover:scale-105">
            {isExplaining ? "Explicando..." : "Explica este código"}
          </button>
        </div>

        <div className="bg-[#1e293b] rounded-xl p-4 border border-green-600">
          <h2 className="text-lg font-semibold mb-2 text-white">Output:</h2>
          <pre className={`text-sm whitespace-pre-wrap ${output.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {output}
          </pre>
        </div>

        {suggestions.length > 0 && (
          <div className="bg-[#1e293b] rounded-xl p-4 border border-yellow-500">
            <h2 className="text-lg font-semibold mb-2 text-yellow-400">Sugerencias inteligentes:</h2>
            <ul className="list-disc ml-5 text-sm text-yellow-300 space-y-1">
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button onClick={() => aplicarSugerencia(s)} disabled={usedSuggestions.has(s)} className={`transition ${usedSuggestions.has(s) ? 'text-gray-500 cursor-not-allowed' : 'hover:text-yellow-200 hover:underline'}`}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showQR && (
          <div className="text-center mt-8 space-y-2">
            <p className="text-yellow-300 text-sm">🔗 Link generado:</p>
            <a href={shareLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-words text-sm">
              {shareLink}
            </a>
            <div className="inline-block mt-4">
              <QRCode value={shareLink} size={160} bgColor="#ffffff" fgColor="#0f172a" />
            </div>
          </div>
        )}

        {explanation && (
          <div className="bg-[#1e293b] rounded-xl p-4 border border-cyan-400 mt-6">
            <h2 className="text-lg font-semibold mb-2 text-cyan-300">🧠 Explicación del código:</h2>
            <p className="text-sm text-cyan-200 whitespace-pre-wrap">{explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

