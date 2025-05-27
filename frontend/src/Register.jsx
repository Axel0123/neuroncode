import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/register', form);
      setMessage('¡Cuenta creada con éxito!');
      navigate('/');
    } catch {
      setMessage('Este usuario ya existe.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a] px-4">
      <div className="w-full max-w-md bg-[#1e293b] p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Crear Cuenta</h2>
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
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition duration-200 font-semibold"
          >
            Registrarse
          </button>
        </form>
        {message && <p className="text-center mt-4 text-green-400">{message}</p>}
      </div>
    </div>
  );
}

export default Register;
