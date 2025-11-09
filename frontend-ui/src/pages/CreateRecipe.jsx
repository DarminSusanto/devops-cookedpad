// /frontend-ui/src/pages/CreateRecipe.jsx

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ubah string "bahan1, bahan2" menjadi array ["bahan1", "bahan2"]
    const ingredientsArray = formData.ingredients.split(',').map(item => item.trim()).filter(Boolean);

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
      const res = await axios.post(API_URL, recipeData, config);

      setMessage('Resep berhasil dibuat! Mengarahkan ke Home...');
      // If response contains recipe id, navigate to that recipe
      if (res?.data?.recipe?._id) {
        setTimeout(() => navigate(`/recipe/${res.data.recipe._id}`), 800);
      } else {
        setTimeout(() => navigate('/'), 1000);
      }

    } catch (error) {
      const errMsg = error?.response?.data?.message || error.message || 'Terjadi kesalahan';
      setMessage('Gagal membuat resep: ' + errMsg);
    }
  };

  return (
    <div className="main-content">
      <div className="container">
        <h2 className="page-title">Buat Resep Baru</h2>

        <form onSubmit={handleSubmit} style={{background:'#fff', padding:16, borderRadius:8, maxWidth:720}}>
          <div style={{marginBottom:12}}>
            <label>Judul Resep</label><br />
            <input type="text" name="title" onChange={handleChange} value={formData.title} required style={{width:'100%', padding:8}} />
          </div>

          <div style={{marginBottom:12}}>
            <label>Deskripsi Singkat</label><br />
            <input type="text" name="description" onChange={handleChange} value={formData.description} style={{width:'100%', padding:8}} />
          </div>

          <div style={{marginBottom:12}}>
            <label>Bahan-bahan (pisahkan dengan koma)</label><br />
            <input type="text" name="ingredients" placeholder="cth: 1 piring nasi, 2 siung bawang" onChange={handleChange} value={formData.ingredients} required style={{width:'100%', padding:8}} />
          </div>

          <div style={{marginBottom:12}}>
            <label>Instruksi</label><br />
            <textarea name="instructions" rows={6} onChange={handleChange} value={formData.instructions} required style={{width:'100%', padding:8}} />
          </div>

          <button type="submit" className="btn btn-primary">Simpan Resep</button>
          {message && <p style={{marginTop:12}}>{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default CreateRecipe;