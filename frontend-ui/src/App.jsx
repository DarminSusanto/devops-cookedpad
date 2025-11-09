// /frontend-ui/src/App.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:3002/recipes';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllRecipes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setRecipes(response.data);
    } catch (error) {
      console.error("Gagal mengambil semua resep:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRecipes();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) {
      fetchAllRecipes();
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/search?q=${searchTerm}`);
      setRecipes(response.data);
    } catch (error) {
      console.error("Gagal mencari resep:", error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Temukan Resep Terbaru</h1>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari resep berdasarkan judul (cth: Nasi Goreng)"
          className="search-input"
        />
        <button type="submit" className="search-btn">Cari</button>
      </form>

      {loading && <p className="muted" style={{textAlign:'center'}}>Loading resep...</p>}

      {!loading && recipes.length === 0 && (
        <p className="muted" style={{textAlign:'center'}}>
          {searchTerm ? `Resep untuk "${searchTerm}" tidak ditemukan.` : `Belum ada resep. Jadilah yang pertama membuat resep!`}
        </p>
      )}

      <div className="recipes-grid" style={{marginTop:20}}>
        {recipes.map((recipe) => (
          <Link to={`/recipe/${recipe._id}`} key={recipe._id} className="card">
            <div className="thumb">Gambar Resep</div>
            <div className="body">
              <h2 className="title">{recipe.title}</h2>
              <p className="meta">Oleh: {recipe.user?.email || 'User Telah Dihapus'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default App;