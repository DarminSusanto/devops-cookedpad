// /frontend-ui/src/App.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import 'Link' untuk membuat resep bisa di-klik

// Ini adalah URL API resep Anda (dari docker-compose.yml)
const API_URL = 'http://localhost:3002/recipes';

function App() {
  // Siapkan 'state' untuk menyimpan data resep
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gunakan 'useEffect' untuk mengambil data saat komponen dimuat
  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);
        // Panggil API menggunakan axios!
        const response = await axios.get(API_URL);
        
        // Simpan data resep ke 'state'
        setRecipes(response.data); 
      } catch (error) {
        console.error("Gagal mengambil resep:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []); // [] berarti "jalankan satu kali saat memuat"

  // Tampilkan data resep ke layar
  return (
    <div className="text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Judul Halaman (Navbar sudah ada di AppLayout) */}
        <h1 className="text-3xl font-bold text-center mb-8">
          Temukan Resep Terbaru
        </h1>

        {/* Tampilkan pesan loading */}
        {loading && <p className="text-center text-gray-400">Loading resep...</p>}

        {/* Tampilkan jika tidak ada resep */}
        {!loading && recipes.length === 0 && (
          <p className="text-center text-gray-400">
            Belum ada resep. Jadilah yang pertama <Link to="/create-recipe" className="text-green-400 underline">membuat resep</Link>!
          </p>
        )}

        {/* Tampilkan daftar resep dalam bentuk grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            // Setiap resep adalah 'Link' ke halaman detailnya
            <Link 
              to={`/recipe/${recipe._id}`} // Cth: /recipe/12345abc
              key={recipe._id} 
              className="block bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
            >
              <h2 className="text-2xl font-bold mb-2 truncate">{recipe.title}</h2>
              <p className="text-gray-400 mb-2 text-sm">
                Oleh: {recipe.user?.email || 'User Telah Dihapus'}
              </p>
              <p className="text-gray-300 mb-4 truncate">{recipe.description}</p>
              
              <h3 className="text-lg font-semibold mb-2">Bahan-bahan:</h3>
              <ul className="list-disc list-inside text-gray-400 text-sm">
                {/* Hanya tampilkan 3 bahan pertama */}
                {recipe.ingredients.slice(0, 3).map((item, index) => (
                  <li key={index} className="truncate">{item}</li>
                ))}
                {recipe.ingredients.length > 3 && (
                  <li className="text-gray-500 italic">...dan lainnya</li>
                )}
              </ul>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

export default App;