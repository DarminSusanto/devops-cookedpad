// /frontend-ui/src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Import hook Auth
import { useNavigate, Link } from 'react-router-dom';

// URL API DARI DUA SERVICE
// service-users is exposed on host port 3001 in this environment
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
  const [passwordMessage, setPasswordMessage] = useState('');
  const [recipes, setRecipes] = useState([]);

  // Ambil list resep user (sederhana: ambil semua dan filter client-side)
  useEffect(() => {
    const fetchUserRecipes = async () => {
      try {
        const res = await axios.get('http://localhost:3002/recipes');
        const all = res.data || [];
        const my = all.filter(r => {
          // beberapa service mengisi user sebagai object dengan _id atau id
          const uid = user?.id || user?._id || (user && user.id);
          const authorId = r.user?._id || r.user?.id || r.user;
          return uid && authorId && String(authorId) === String(uid);
        });
        setRecipes(my);
      } catch (err) {
        // ignore
      }
    };
    fetchUserRecipes();
  }, [user]);

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

  // --- Change password ---
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const handlePasswordChange = (e) => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.put(`${USER_API_URL}/me/password`, passwordForm, config);
      setPasswordMessage(res.data.message || 'Password diperbarui');
      setPasswordForm({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setPasswordMessage(err?.response?.data?.message || 'Gagal mengganti password');
    }
  };


  if (!user) return <p>Loading...</p>;

  return (
    <div className="main-content">
      <div className="container">
        <h1 className="page-title">Profil Saya</h1>

        <div style={{display:'flex', gap:20}}>
          <div style={{flex:'1 1 300px'}}>
            <div style={{background:'#fff', padding:16, borderRadius:8}}>
              <img src={user.profilePictureUrl || 'https://via.placeholder.com/160'} alt="profil" style={{width:160, height:160, borderRadius:8, objectFit:'cover'}} />
              <h3 style={{marginTop:12}}>{user.displayName || user.email}</h3>
              <p className="muted">{user.bio}</p>
            </div>

            <div style={{marginTop:20, background:'#fff', padding:12, borderRadius:8}}>
              <h3 style={{marginTop:0}}>Resep Saya</h3>
              {recipes.length === 0 ? (
                <div>
                  <p className="muted">Belum ada resep.</p>
                  <Link to="/create-recipe" className="btn btn-primary" style={{display:'inline-block', marginTop:10}}>Buat Resep</Link>
                </div>
              ) : (
                <ul style={{paddingLeft:16}}>
                  {recipes.map(r => (
                    <li key={r._id} style={{marginBottom:8}}>
                      <Link to={`/recipe/${r._id}`}>{r.title}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div style={{flex:'2 1 600px'}}>
            <form onSubmit={handleInfoSubmit} style={{background:'#fff', padding:16, borderRadius:8, marginBottom:16}}>
              <h2>Edit Info</h2>
              <div style={{marginBottom:8}}>
                <label>Nama Tampilan</label><br />
                <input name="displayName" value={infoData.displayName} onChange={handleInfoChange} style={{width:'100%', padding:8}} />
              </div>
              <div style={{marginBottom:8}}>
                <label>Bio Singkat</label><br />
                <textarea name="bio" rows={3} value={infoData.bio} onChange={handleInfoChange} style={{width:'100%', padding:8}} />
              </div>
              <button className="btn btn-primary" type="submit">Simpan Info Profil</button>
              {message && <p className="muted">{message}</p>}
            </form>

            <form onSubmit={handleUploadSubmit} style={{background:'#fff', padding:16, borderRadius:8, marginBottom:16}}>
              <h2>Ubah Foto Profil</h2>
              <div style={{marginBottom:8}}>
                <input type="file" name="file" accept="image/png,image/jpeg" onChange={handleFileChange} />
              </div>
              <button className="btn" type="submit" disabled={!selectedFile}>Upload Gambar</button>
              {uploadMessage && <p className="muted">{uploadMessage}</p>}
            </form>

            <form onSubmit={handlePasswordSubmit} style={{background:'#fff', padding:16, borderRadius:8}}>
              <h2>Ganti Password</h2>
              <div style={{marginBottom:8}}>
                <label>Password Lama</label><br />
                <input name="oldPassword" type="password" value={passwordForm.oldPassword} onChange={handlePasswordChange} style={{width:'100%', padding:8}} />
              </div>
              <div style={{marginBottom:8}}>
                <label>Password Baru</label><br />
                <input name="newPassword" type="password" value={passwordForm.newPassword} onChange={handlePasswordChange} style={{width:'100%', padding:8}} />
              </div>
              <button className="btn btn-primary" type="submit">Ganti Password</button>
              {passwordMessage && <p className="muted">{passwordMessage}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;