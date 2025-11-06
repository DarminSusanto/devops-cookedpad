// /frontend-ui/src/pages/CreateRecipe.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const API_URL = 'http://localhost:3002/recipes';


function CreateRecipe() {
  const { token } = useAuth(); // Ambil token dari context
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ubah string "bahan1, bahan2" menjadi array ["bahan1", "bahan2"]
    const ingredientsArray = formData.ingredients.split(',').map(item => item.trim());

    try {
      // Siapkan data untuk dikirim
      const recipeData = {
        title: formData.title,
        description: formData.description,
        ingredients: ingredientsArray,
        instructions: formData.instructions,
      };

      // Siapkan 'headers' untuk mengirim token
      const config = {
        headers: {
          'x-auth-token': token // Kirim token di header
        }
      };

      // Panggil API (kirim data + config)
      await axios.post(API_URL, recipeData, config);

      setMessage('Resep berhasil dibuat! Mengarahkan ke Home...');
      setTimeout(() => navigate('/'), 2000);

    } catch (error) {
      setMessage('Gagal membuat resep: ' + error.response.data.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">Buat Resep Baru</h2>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg">

        <div className="mb-4">
          <label className="block mb-2">Judul Resep</label>
          <input
            type="text"
            name="title"
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Deskripsi Singkat</label>
          <input
            type="text"
            name="description"
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Bahan-bahan (pisahkan dengan koma)</label>
          <input
            type="text"
            name="ingredients"
            placeholder="cth: 1 piring nasi, 2 siung bawang, 1 butir telur"
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2">Instruksi</label>
          <textarea
            name="instructions"
            rows="5"
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700"
            required
          />
        </div>

        <button type="submit" className="w-full bg-green-600 p-3 rounded font-bold hover:bg-green-500">
          Simpan Resep
        </button>
        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </div>
  );
}

export default CreateRecipe;