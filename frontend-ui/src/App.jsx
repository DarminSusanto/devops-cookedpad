// /frontend-ui/src/App.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// URL API dari service-recipes
const API_URL = 'http://localhost:3002/recipes';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- 1. STATE BARU UNTUK SEARCH ---
  const [searchTerm, setSearchTerm] = useState('');

  // Fungsi untuk mengambil SEMUA resep (saat halaman dimuat)
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

  // Jalankan fetchAllRecipes() satu kali saat halaman dimuat
  useEffect(() => {
    fetchAllRecipes();
  }, []);

  // --- 2. FUNGSI BARU UNTUK MENANGANI PENCARIAN ---
  const handleSearch = async (e) => {
    e.preventDefault(); // Mencegah form me-refresh halaman
    if (!searchTerm) {
      // Jika search bar kosong, ambil semua resep
      fetchAllRecipes();
      return;
    }
    
    try {
      setLoading(true);
      // Panggil API pencarian di backend
      const response = await axios.get(`${API_URL}/search?q=${searchTerm}`);
      setRecipes(response.data); // Update daftar resep dengan hasil pencarian
    } catch (error) {
      console.error("Gagal mencari resep:", error);
      setRecipes([]); // Kosongkan resep jika pencarian error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Temukan Resep Terbaru
        </h1>

        {/* --- 3. TAMBAHKAN FORM SEARCH BAR DI SINI --- */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8 flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari resep berdasarkan judul (cth: Nasi Goreng)"
            className="w-full p-3 rounded-l-lg bg-gray-700 text-white border-2 border-gray-700 focus:outline-none focus:border-green-500"
          />
          <button
            type="submit"
            className="bg-green-600 px-6 py-3 rounded-r-lg font-bold hover:bg-green-500"
          >
            Cari
          </button>
        </form>

        {/* --- 4. TAMPILKAN HASIL --- */}
        {loading && <p className="text-center text-gray-400">Loading resep...</p>}

        {!loading && recipes.length === 0 && (
          <p className="text-center text-gray-400">
            {searchTerm 
              ? `Resep untuk "${searchTerm}" tidak ditemukan.` 
              : `Belum ada resep. Jadilah yang pertama membuat resep!`
            }
          </p>
        )}

        {/* Daftar Resep (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Link 
              to={`/recipe/${recipe._id}`} 
              key={recipe._id} 
              className="block bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
            >
              {/* ... (sisa kode card resep SAMA PERSIS) ... */}
              <h2 className="text-2xl font-bold mb-2 truncate">{recipe.title}</h2>
              <p className="text-gray-400 mb-2 text-sm">
                Oleh: {recipe.user?.email || 'User Telah Dihapus'}
              </p>
              {/* ... (sisa kode SAMA) ... */}
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

export default App;