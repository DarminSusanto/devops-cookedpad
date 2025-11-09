// /frontend-ui/src/components/Navbar.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <div style={{display: 'flex', alignItems: 'center'}}>
          {/* left spacer for future items */}
        </div>

        <div style={{display:'flex', justifyContent:'center', width:'100%'}}>
          <Link to="/" className="logo">
            <span className="emoji">🍳</span>
            <span className="brand">CookedPad</span>
          </Link>
        </div>

        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              <Link to="/create-recipe" className="btn btn-primary" style={{display:'inline-block'}}>+ Tulis Resep</Link>
              <Link to="/profile"><img src={user?.profilePictureUrl || 'https://via.placeholder.com/40'} alt="Profil" className="profile-img"/></Link>
              <button onClick={handleLogout} className="btn btn-ghost">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Masuk</Link>
              <Link to="/register" className="btn btn-primary">Daftar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;