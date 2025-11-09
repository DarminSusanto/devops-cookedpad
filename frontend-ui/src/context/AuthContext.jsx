// /frontend-ui/src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import * as jwtDecodeLib from 'jwt-decode';

// jwt-decode package ships different shapes depending on build; normalize here
const jwtDecode = (token) => {
  if (!jwtDecodeLib) return null;
  // prefer default export, then named jwtDecode, then module itself
  const fn = jwtDecodeLib.default || jwtDecodeLib.jwtDecode || jwtDecodeLib;
  try {
    return fn(token);
  } catch (e) {
    return null;
  }
};

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
      return;
    }

    // if we have a token but no user data, try to fetch /me
    const tryFetchMe = async () => {
      if (!storedToken) return;
      setToken(storedToken);
      try {
        const res = await axios.get('http://localhost:3001/me', {
          headers: { 'x-auth-token': storedToken }
        });
        if (res && res.data) {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
          return;
        }
      } catch (err) {
        // fallback to decoded token
        try {
          const decoded = jwtDecode(storedToken);
          if (decoded && decoded.user) setUser(decoded.user);
        } catch (e) {
          setUser(null);
        }
      }
    };

    tryFetchMe();
  }, []);

  // Fungsi untuk login
  // login: store token then try to fetch full profile from the users service (/me)
  const login = async (newToken) => {
    try {
      // save token immediately
      localStorage.setItem('token', newToken);
      setToken(newToken);

      // attempt to fetch full user profile from users service
      const res = await axios.get('http://localhost:3001/me', {
        headers: { 'x-auth-token': newToken }
      });

      if (res && res.data) {
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
        return;
      }
    } catch (err) {
      // ignore fetch error and fallback to decoded token
    }

    // fallback: decode token and store minimal user info
    try {
      const decodedUser = jwtDecode(newToken);
      if (decodedUser && decodedUser.user) {
        localStorage.setItem('user', JSON.stringify(decodedUser.user));
        setUser(decodedUser.user);
      }
    } catch (e) {
      // if decode also fails, ensure user is null
      setUser(null);
    }
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