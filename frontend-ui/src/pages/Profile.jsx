// /frontend-ui/src/pages/Profile.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Import hook Auth
import { useNavigate } from 'react-router-dom';

// URL API DARI DUA SERVICE
const USER_API_URL = 'http://localhost:3001'; // service-users
const UPLOAD_API_URL = 'http://localhost:3004'; // service-upload

function Profile() {
  const { user, token, login } = useAuth(); // Ambil data user, token, dan fungsi login (untuk update)
  const navigate = useNavigate();

  // State untuk form info profil
  const [infoData, setInfoData] = useState({
    displayName: user.displayName || '',
    bio: user.bio || ''
  });
  
  // State untuk form upload gambar
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');

  // --- Handler untuk Form Info Profil ---
  const handleInfoChange = (e) => {
    setInfoData({ ...infoData, [e.target.name]: e.target.value });
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { 'x-auth-token': token } };
      // Panggil API service-users
      const res = await axios.put(`${USER_API_URL}/me`, infoData, config);
      
      // Perbarui 'user' di AuthContext (cara curang tapi efektif)
      // Kita buat ulang token palsu dengan data baru
      const newToken = localStorage.getItem('token'); // Ambil token yg ada
      if (newToken) {
        login(newToken); // Panggil login() untuk me-refresh data user dari token
      }
      
      setMessage('Info profil berhasil diperbarui!');
    } catch (error) {
      setMessage('Gagal memperbarui profil: ' + error.response.data.message);
    }
  };

  // --- Handler untuk Form Upload Gambar ---
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile); // 'file' harus cocok dgn nama di Multer

    try {
      // 1. Upload gambar ke service-upload
      const uploadRes = await axios.post(`${UPLOAD_API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const imageUrl = uploadRes.data.url; // URL gambar baru
      setUploadMessage('Gambar berhasil di-upload! Menyimpan URL...');

      // 2. Simpan URL gambar baru ke service-users
      const config = { headers: { 'x-auth-token': token } };
      // Kita Panggil PUT /me lagi, tapi kali ini untuk profilePictureUrl
      await axios.put(`${USER_API_URL}/me`, { profilePictureUrl: imageUrl }, config);

      // 3. Perbarui AuthContext lagi
      const newToken = localStorage.getItem('token');
      if (newToken) {
        login(newToken); // Panggil login() untuk refresh data user
      }

      setUploadMessage('Foto profil berhasil diperbarui!');
      setSelectedFile(null);
      
    } catch (error) {
      setUploadMessage('Upload gagal: ' + error.response.data.message);
    }
  };


  if (!user) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Profil Saya</h1>

      {/* --- Form 1: Edit Info Profil --- */}
      <form onSubmit={handleInfoSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">Edit Info</h2>
        <div className="mb-4">
          <label className="block mb-2">Nama Tampilan</label>
          <input
            type="text"
            name="displayName"
            value={infoData.displayName}
            onChange={handleInfoChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2">Bio Singkat</label>
          <textarea
            name="bio"
            rows="3"
            value={infoData.bio}
            onChange={handleInfoChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 p-3 rounded font-bold hover:bg-blue-500">
          Simpan Info Profil
        </button>
        {message && <p className="mt-4 text-center">{message}</p>}
      </form>

      {/* --- Form 2: Upload Foto Profil --- */}
      <form onSubmit={handleUploadSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Ubah Foto Profil</h2>
        <div className="mb-4">
          <label className="block mb-2">Pilih Gambar (JPG/PNG)</label>
          <input
            type="file"
            name="file"
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
            className="w-full p-2 rounded bg-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-500"
          />
        </div>
        <button type="submit" className="w-full bg-green-600 p-3 rounded font-bold hover:bg-green-500" disabled={!selectedFile}>
          Upload Gambar
        </button>
        {uploadMessage && <p className="mt-4 text-center">{uploadMessage}</p>}
      </form>
    </div>
  );
}

export default Profile;