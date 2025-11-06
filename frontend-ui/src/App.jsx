// /frontend-ui/src/App.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // <-- PASTIKAN INI ADA

// Ini adalah URL API resep Anda (dari docker-compose.yml)
const API_URL = 'http://localhost:3002/recipes';

function App() {
  // 1. Siapkan 'state' untuk menyimpan data resep
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Gunakan 'useEffect' untuk mengambil data
  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);
        const response = await axios.get(API_URL); // <-- PASTIKAN INI ADA
        setRecipes(response.data); 
      } catch (error) {
        console.error("Gagal mengambil resep:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []); 

  // 5. Tampilkan data resep ke layar
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-green-400">
          🍳 Katalog Resep 🍳
        </h1>

        {loading && <p className="text-center">Loading resep...</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* INI BAGIAN PENTING YANG AKAN MENAMPILKAN RESEP */}
          {recipes.map((recipe) => (
            <div key={recipe._id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-2">{recipe.title}</h2>
              <p className="text-gray-400 mb-4">{recipe.description}</p>

              <h3 className="text-lg font-semibold mb-2">Bahan-bahan:</h3>
              <ul className="list-disc list-inside text-gray-300">
                {recipe.ingredients.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default App;