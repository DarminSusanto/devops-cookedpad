// /frontend-ui/src/pages/EditRecipe.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3002/recipes';

function EditRecipe() {
  const { id } = useParams(); // Ambil ID resep dari URL
  const { token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // 1. Ambil data resep yang ada untuk mengisi form
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(`${API_URL}/${id}`);
        const recipe = res.data;

        // Set form data dengan data yang ada
        setFormData({
          title: recipe.title,
          description: recipe.description,
          // Ubah array ['a', 'b'] menjadi string "a, b"
          ingredients: recipe.ingredients.join(', '), 
          instructions: recipe.instructions
        });
        setLoading(false);
      } catch (error) {
        console.error('Gagal mengambil resep', error);
        setMessage('Resep tidak ditemukan');
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Kirim data yang sudah diedit (PUT request)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const ingredientsArray = formData.ingredients.split(',').map(item => item.trim());

    try {
      const recipeData = {
        title: formData.title,
        description: formData.description,
        ingredients: ingredientsArray,
        instructions: formData.instructions,
      };

      const config = { headers: { 'x-auth-token': token } };

      // 3. Gunakan axios.put()
      await axios.put(`${API_URL}/${id}`, recipeData, config);

      setMessage('Resep berhasil diperbarui! Mengarahkan...');
      setTimeout(() => navigate(`/recipe/${id}`), 2000); // Arahkan kembali ke halaman detail

    } catch (error) {
      setMessage('Gagal memperbarui resep: ' + error.response.data.message);
    }
  };

  if (loading) return <p className="text-white text-center p-8">Loading data resep...</p>;

  return (
    <div className="max-w-2xl mx-auto p-8 text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">Edit Resep</h2>
      {/* Form-nya sama persis seperti CreateRecipe */}
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="mb-4">
          <label className="block mb-2">Judul Resep</label>
          <input
            type="text"
            name="title"
            value={formData.title} // <-- Tambahkan value
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Deskripsi Singkat</label>
          <input
            type="text"
            name="description"
            value={formData.description} // <-- Tambahkan value
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Bahan-bahan (pisahkan dengan koma)</label>
          <input
            type="text"
            name="ingredients"
            value={formData.ingredients} // <-- Tambahkan value
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2">Instruksi</label>
          <textarea
            name="instructions"
            rows="5"
            value={formData.instructions} // <-- Tambahkan value
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>

        <button type="submit" className="w-full bg-yellow-600 p-3 rounded font-bold hover:bg-yellow-500">
          Simpan Perubahan
        </button>
        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </div>
  );
}

export default EditRecipe;