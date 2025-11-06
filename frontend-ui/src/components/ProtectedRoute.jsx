// /frontend-ui/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Komponen ini akan "membungkus" rute yang ingin Anda proteksi
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth(); // Cek status login dari context

  // Jika user sudah login (autentikasi), izinkan mereka
  // dengan merender <Outlet /> (Outlet = komponen anak, cth: <CreateRecipe />)
  if (isAuthenticated) {
    return <Outlet />;
  }

  // Jika user BELUM login, "tendang" (redirect) mereka
  // ke halaman /login
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;