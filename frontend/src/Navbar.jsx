import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [username, setUsername] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (token) {
      axios
        .get('http://localhost:8000/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUsername(res.data.username))
        .catch(() => setUsername(''));
    }
  }, [token]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUsername('');
    navigate('/');
  };

  return (
    <nav className="bg-[#1e293b] text-white px-6 py-3 shadow-md flex items-center justify-between">
      <h1 className="text-xl font-bold text-blue-400 tracking-wide">CodePulse</h1>

      <div className="flex items-center space-x-4 text-sm">
        <Link to="/editor" className="hover:text-blue-400 transition">Editor</Link>
        <Link to="/history" className="hover:text-blue-400 transition">Historial</Link>

        {!token ? (
          <>
            <Link to="/" className="hover:text-blue-400 transition">Login</Link>
            <Link to="/register" className="hover:text-blue-400 transition">Registro</Link>
          </>
        ) : (
          <>
            <span className="text-gray-300">👤 {username}</span>
            <button onClick={handleLogout} className="hover:text-red-400 transition">Logout</button>
          </>
        )}

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="ml-2 text-yellow-300 hover:text-yellow-400 transition"
          title="Cambiar tema"
        >
          {darkMode ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
}

