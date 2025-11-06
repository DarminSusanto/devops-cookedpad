// /frontend-ui/src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // <-- 1. IMPORT

// Buat Context-nya
const AuthContext = createContext();

// Buat "Provider" (pembungkus)
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); // <-- 2. TAMBAHKAN STATE USER

  // Cek localStorage saat aplikasi pertama kali dimuat
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fungsi untuk login
  const login = (newToken) => {
    const decodedUser = jwtDecode(newToken); // <-- 3. DECODE TOKEN
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(decodedUser.user)); // <-- 4. SIMPAN USER
    
    setToken(newToken);
    setUser(decodedUser.user); // <-- 5. SET STATE USER
  };

  // Fungsi untuk logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // <-- 6. HAPUS USER
    setToken(null);
    setUser(null); // <-- 7. KOSONGKAN STATE USER
  };

  const isAuthenticated = !!token; // true jika token ada, false jika null

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Buat "Hook" kustom
export const useAuth = () => {
  return useContext(AuthContext);
};