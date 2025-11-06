// /frontend-ui/src/pages/Register.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// API URL dari service-users
const API_URL = 'http://localhost:3001/register';

function Register() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Inisialisasi hook navigasi

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Panggil API register di backend Anda!
      const response = await axios.post(API_URL, formData);
      setMessage(response.data.message + ". Mengarahkan ke Login..."); // "User berhasil didaftarkan"
      
      // Jika berhasil, tunggu 2 detik lalu arahkan ke halaman Login
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      // Menampilkan error jika email sudah terdaftar
      setMessage(error.response.data.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold mb-6 text-center">Register</h2>
        <div className="mb-4">
          <label className="block mb-2">Email</label>
          <input
            type="email"
            name="email"
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white" // Pastikan teks juga putih
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2">Password</label>
          <input
            type="password"
            name="password"
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white" // Pastikan teks juga putih
            required
          />
        </div>
        <button type="submit" className="w-full bg-green-600 p-3 rounded font-bold hover:bg-green-500">
          Daftar
        </button>
        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </div>
  );
}

export default Register;