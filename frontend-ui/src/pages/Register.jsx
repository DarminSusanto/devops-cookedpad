// /frontend-ui/src/pages/Register.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// API URL dari service-users (service-users berjalan di port 3001 pada host)
const API_URL = 'http://localhost:3001/register';

function Register() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(API_URL, formData);
      setMessage(response.data.message + ' — mengarahkan ke Login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Pendaftaran gagal');
    }
  };

  return (
    <div className="main-content">
      <div className="container" style={{maxWidth:480}}>
        <h1 className="page-title">Register</h1>
        <form onSubmit={handleSubmit} style={{background:'#fff', padding:20, borderRadius:8, boxShadow:'0 1px 3px rgba(0,0,0,.06)'}}>
          <div style={{marginBottom:12}}>
            <label>Email</label><br />
            <input name="email" type="email" value={formData.email} onChange={handleChange} style={{width:'100%', padding:8, marginTop:6}} required />
          </div>
          <div style={{marginBottom:12}}>
            <label>Password</label><br />
            <input name="password" type="password" value={formData.password} onChange={handleChange} style={{width:'100%', padding:8, marginTop:6}} required />
          </div>
          <div>
            <button type="submit" className="btn btn-primary">Daftar</button>
            <button type="button" className="btn" style={{marginLeft:8}} onClick={() => navigate('/login')}>Masuk</button>
          </div>
          {message && <p style={{marginTop:12}} className="muted">{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default Register;