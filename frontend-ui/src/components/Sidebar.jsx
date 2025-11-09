// /frontend-ui/src/components/Sidebar.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/" style={{color: isActive('/') ? '#f97316' : undefined}}>
                <span style={{fontSize: '18px'}}>🔍</span>
                <span style={{marginLeft:8}}>Cari</span>
              </Link>
            </li>
            <li>
              <Link to="/posting-bareng" style={{color: isActive('/posting-bareng') ? '#f97316' : undefined}}>
                <span style={{fontSize: '18px'}}>🤝</span>
                <span style={{marginLeft:8}}>Posting Bareng</span>
              </Link>
            </li>

            {isAuthenticated && (
              <>
                <li>
                  <Link to="/my-recipes" style={{color: isActive('/my-recipes') ? '#f97316' : undefined}}>
                    <span style={{fontSize: '18px'}}>📚</span>
                    <span style={{marginLeft:8}}>Koleksi Resep</span>
                  </Link>
                </li>
                <li>
                  <Link to="/profile" style={{color: isActive('/profile') ? '#f97316' : undefined}}>
                    <span style={{fontSize: '18px'}}>👤</span>
                    <span style={{marginLeft:8}}>Profil Saya</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {!isAuthenticated && (
          <div className="muted" style={{marginTop: 18}}>
            Untuk mulai membuat koleksi resep,
            silakan <Link to="/register" style={{color:'#f97316', textDecoration:'underline'}}> daftar atau masuk</Link>.
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;