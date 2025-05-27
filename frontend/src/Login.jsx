import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('https://neuroncode.onrender.com/login', new URLSearchParams(form));
      localStorage.setItem('token', res.data.access_token);
      setMessage('Inicio de sesión exitoso');
      navigate('/editor');
    } catch {
      setMessage('Credenciales incorrectas.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a] px-4">
      <div className="w-full max-w-md bg-[#1e293b] p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            type="text"
            placeholder="Usuario o correo"
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition duration-200 font-semibold"
          >
            Iniciar Sesión
          </button>
        </form>
        {message && <p className="text-center mt-4 text-red-400">{message}</p>}
      </div>
    </div>
  );
}

export default Login;
