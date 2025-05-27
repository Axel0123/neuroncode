import React, { useEffect, useState } from 'react';

export default function History({ onReRun }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:8000/history", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setHistory);
  }, []);

  const handleExportPDF = async (item) => {
    const response = await fetch('http://localhost:8000/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: item.code,
        output: item.output,
        suggestions: [] // si tienes sugerencias almacenadas, agrégalas aquí
      })
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'codepulse_reporte.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      alert('❌ Error al generar el PDF.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-400">📜 Historial de Ejecuciones</h1>

        {history.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">No hay ejecuciones guardadas aún.</p>
        ) : (
          history.map((item, i) => (
            <div key={i} className="bg-[#1e293b] p-4 rounded-xl mb-4 border border-slate-600">
              <p className="text-sm text-gray-400 mb-1">🕒 {item.timestamp}</p>

              <div className="text-green-300 font-mono text-sm whitespace-pre-wrap mb-2">
                <strong className="text-white">Código:</strong><br />{item.code}
              </div>

              <div className="text-green-200 font-mono text-sm whitespace-pre-wrap mb-2">
                <strong className="text-white">Salida:</strong><br />{item.output}
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => onReRun(item.code)}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1 rounded"
                >
                  Ejecutar de nuevo
                </button>

                <button
                  onClick={() => handleExportPDF(item)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-1 rounded"
                >
                  📄 Exportar PDF
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
