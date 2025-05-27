import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function SharedView() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`https://neuroncode.onrender.com/share/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setData)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-white text-center mt-10">Cargando...</p>;
  if (notFound) return <p className="text-red-500 text-center mt-10">❌ Código no encontrado</p>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-blue-400 text-center">Código Compartido</h1>
        <p className="text-center text-sm text-gray-400">Compartido el {data.timestamp}</p>

        <div className="bg-[#1e293b] p-4 rounded-xl border border-blue-500">
          <h2 className="text-lg font-semibold mb-2">Código:</h2>
          <pre className="whitespace-pre-wrap text-green-300 text-sm">{data.code}</pre>
        </div>

        <div className="bg-[#1e293b] p-4 rounded-xl border border-green-500">
          <h2 className="text-lg font-semibold mb-2">Resultado:</h2>
          <pre className="whitespace-pre-wrap text-green-200 text-sm">{data.output}</pre>
        </div>
      </div>
    </div>
  );
}
