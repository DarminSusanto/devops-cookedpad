// /frontend-ui/src/pages/Login.jsx

// ... (semua import Anda SAMA) ...
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// API URL service-users (mapped to host port 3001)
const API_URL = 'http://localhost:3001/login';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const auth = useAuth();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(API_URL, formData);
      // Wait for AuthContext to finish fetching /me and storing user
      await auth.login(response.data.token);
      setMessage('Login berhasil — mengalihkan...');
      // navigate after small delay so user sees the message
      setTimeout(() => navigate('/'), 600);
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Login gagal');
    }
  };

  return (
    <div className="main-content">
      <div className="container" style={{maxWidth:480}}>
        <h1 className="page-title">Masuk</h1>
        <form onSubmit={handleSubmit} style={{background:'#fff', padding:20, borderRadius:8, boxShadow:'0 1px 3px rgba(0,0,0,.06)'}}>
          <div style={{marginBottom:12}}>
            <label>Email</label><br />
            <input name="email" type="email" value={formData.email} onChange={handleChange} style={{width:'100%', padding:8, marginTop:6}} required />
          </div>
          <div style={{marginBottom:12}}>
            <label>Password</label><br />
            <input name="password" type="password" value={formData.password} onChange={handleChange} style={{width:'100%', padding:8, marginTop:6}} required />
          </div>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <button type="submit" className="btn btn-primary">Masuk</button>
            <button type="button" className="btn" onClick={() => navigate('/register')}>Daftar</button>
          </div>
          {message && <p style={{marginTop:12}} className="muted">{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;