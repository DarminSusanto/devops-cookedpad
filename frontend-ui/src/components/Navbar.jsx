// /frontend-ui/src/components/Navbar.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import hook kita

function Navbar() {
  // 1. Ambil 'user' (yang berisi profilePictureUrl) dari Auth
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo/Branding */}
        <Link to="/" className="text-2xl font-bold text-green-400">
          🍳 Katalog Resep
        </Link>

        {/* Menu Navigasi */}
        <div className="flex space-x-4 items-center"> {/* Tambahkan 'items-center' */}
          <Link to="/" className="hover:text-green-300">Home</Link>

          {/* Tampilan kondisional berdasarkan status login */}
          {isAuthenticated ? (
            // JIKA SUDAH LOGIN
            <>
              <Link to="/create-recipe" className="hover:text-green-300">Buat Resep</Link>
              
              {/* 2. TAMBAHKAN LINK KE HALAMAN PROFIL */}
              <Link to="/profile" className="hover:text-green-300">
                Profil Saya
              </Link>
              
              <button 
                onClick={handleLogout} 
                className="bg-red-600 px-3 py-1 rounded hover:bg-red-500"
              >
                Logout
              </button>

              {/* 3. TAMPILKAN FOTO PROFIL JIKA ADA */}
              {user?.profilePictureUrl && (
                <img 
                  src={user.profilePictureUrl} 
                  alt="Foto Profil"
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
            </>
          ) : (
            // JIKA BELUM LOGIN
            <>
              <Link to="/login" className="hover:text-green-300">Login</Link>
              <Link to="/register" className="bg-green-600 px-3 py-1 rounded hover:bg-green-500">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;