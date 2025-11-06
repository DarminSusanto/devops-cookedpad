// /frontend-ui/src/pages/Login.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// API URL dari service-users
const API_URL = 'http://localhost:3001/login';


function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Inisialisasi hook navigasi

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Panggil API login di backend Anda!
      const response = await axios.post(API_URL, formData);
      
      // Jika berhasil, backend akan mengirim 'token'
      // Kita simpan token ini di localStorage browser
      localStorage.setItem('token', response.data.token);
      setMessage('Login berhasil! Mengarahkan ke Home...');
      
      // Arahkan user ke halaman utama (Home) setelah 2 detik
      setTimeout(() => {
        navigate('/');
        // Kita perlu reload halaman agar AuthContext dan Navbar update
        window.location.reload(); 
      }, 2000);
      
    } catch (error) {
      setMessage(error.response.data.message); // "Email atau password salah"
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
        <div className="mb-4">
          <label className="block mb-2">Email</label>
          <input
            type="email"
            name="email"
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2">Password</label>
          <input
            type="password"
            name="password"
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 p-3 rounded font-bold hover:bg-blue-500">
          Login
        </button>
        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </div>
  );
}

export default Login;