// /frontend-ui/src/pages/RecipeDetail.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// API URL dari DUA service
const RECIPE_API_URL = 'http://localhost:3002/recipes';
const INTERACTION_API_URL = 'http://localhost:3003/recipes';

function RecipeDetail() {
  const { id } = useParams(); // Ambil ID resep dari URL
  const { isAuthenticated, token, user } = useAuth(); // Cek status login & data user
  const navigate = useNavigate();
  
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengambil SEMUA data (resep + komentar)
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Panggil API Resep
      const recipeRes = await axios.get(`${RECIPE_API_URL}/${id}`);
      setRecipe(recipeRes.data);

      // 2. Panggil API Interaksi (Komentar)
      const commentsRes = await axios.get(`${INTERACTION_API_URL}/${id}/comments`);
      setComments(commentsRes.data);

    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Panggil fetchData() saat halaman dimuat
  useEffect(() => {
    fetchData();
  }, [id]); // [id] berarti fungsi ini akan dijalankan ulang jika ID di URL berubah

  // Fungsi untuk mengirim komentar baru
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment) return;

    try {
      const config = { headers: { 'x-auth-token': token } }; // Kirim token
      const body = { text: newComment };

      // 3. Panggil API Post Komentar (TERPROTEKSI)
      const res = await axios.post(`${INTERACTION_API_URL}/${id}/comments`, body, config);

      // Tambahkan komentar baru ke daftar di layar (real-time)
      setComments([...comments, res.data.comment]);
      setNewComment(''); // Kosongkan kotak input
    } catch (error) {
      console.error('Gagal mengirim komentar:', error);
      alert('Gagal mengirim komentar: ' + error.response.data.message);
    }
  };

  // Fungsi untuk HAPUS RESEP
  const handleDeleteRecipe = async () => {
    // Konfirmasi dulu
    if (!window.confirm('Apakah Anda yakin ingin menghapus resep ini?')) {
      return;
    }

    try {
      const config = { headers: { 'x-auth-token': token } };
      
      // Panggil API DELETE di backend
      await axios.delete(`${RECIPE_API_URL}/${id}`, config);
      
      // Jika berhasil, arahkan kembali ke Home
      alert('Resep berhasil dihapus.');
      navigate('/');

    } catch (error) {
      console.error('Gagal menghapus resep:', error);
      alert('Gagal menghapus resep: ' + error.response.data.message);
    }
  };
  
  if (loading) return <p className="text-white text-center p-8">Loading...</p>;
  if (!recipe) return <p className="text-white text-center p-8">Resep tidak ditemukan.</p>;

  // Cek apakah user yang login adalah pemilik resep
  // (user?.) = Pengecekan aman jika 'user' null
  const isOwner = user?.id === recipe.user?._id;

  return (
    <div className="max-w-4xl mx-auto p-8 text-white">
      {/* Bagian Detail Resep */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg mb-8">
        
        {/* Tampilkan tombol Hapus & Edit HANYA jika pemilik */}
        {isOwner && (
          <div className="float-right space-x-2">
            <button
              onClick={handleDeleteRecipe}
              className="bg-red-600 px-4 py-2 rounded font-bold hover:bg-red-500"
            >
              Hapus
            </button>
            {/* TODO: Buat tombol Edit nanti */}
            {/* <button className="bg-yellow-500 px-4 py-2 rounded font-bold hover:bg-yellow-400">
              Edit
            </button> */}
          </div>
        )}

        <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
        <p className="text-gray-400 mb-2">Oleh: {recipe.user?.email || 'User Telah Dihapus'}</p>
        <p className="text-gray-300 mb-6">{recipe.description}</p>
        
        <h3 className="text-xl font-semibold mb-3">Bahan-bahan:</h3>
        <ul className="list-disc list-inside text-gray-300 mb-6">
          {recipe.ingredients.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <h3 className="text-xl font-semibold mb-3">Instruksi:</h3>
        {/* Ubah \n (baris baru) menjadi tag <br> agar formatnya rapi */}
        <p className="text-gray-300 whitespace-pre-wrap">{recipe.instructions}</p>
      </div>

      {/* Bagian Komentar */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Komentar ({comments.length})</h2>
        
        {/* Form Tambah Komentar (Hanya tampil jika user login) */}
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white"
              rows="3"
              placeholder="Tulis komentar Anda..."
            ></textarea>
            <button type="submit" className="mt-2 bg-blue-600 px-4 py-2 rounded font-bold hover:bg-blue-500">
              Kirim
            </button>
          </form>
        ) : (
          <p className="text-gray-400 mb-6">Silakan <Link to="/login" className="text-blue-400 underline">login</Link> untuk berkomentar.</p>
        )}

        {/* Daftar Komentar */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="bg-gray-700 p-4 rounded">
              <p className="font-bold">{comment.user?.email || 'User Telah Dihapus'}</p>
              <p className="text-gray-300">{comment.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;