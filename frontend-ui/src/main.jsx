// /frontend-ui/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet, // Diperlukan untuk layout
} from "react-router-dom";
import { AuthProvider } from './context/AuthContext'; // Import "Penyimpanan" Auth
import Navbar from './components/Navbar'; // Import Navbar
import ProtectedRoute from './components/ProtectedRoute'; // Import "Penjaga" Rute

// --- Import Semua Halaman Anda ---
import App from './App.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import CreateRecipe from './pages/CreateRecipe.jsx';
import RecipeDetail from './pages/RecipeDetail.jsx';
import EditRecipe from './pages/EditRecipe.jsx';
import './index.css';

/**
 * Komponen "Layout"
 * Ini adalah pembungkus yang memastikan Navbar selalu tampil
 * di atas semua halaman. <Outlet /> adalah tempat di mana
 * komponen halaman (App, Login, dll.) akan dirender.
 */
const AppLayout = () => (
  <div className="min-h-screen bg-gray-900">
    <Navbar />
    <main>
      <Outlet />
    </main>
  </div>
);

// --- Definisikan Rute (URL) Aplikasi Anda ---
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />, // Gunakan AppLayout sebagai elemen induk
    children: [
      // --- Rute Publik (Semua orang bisa akses) ---
      {
        path: "/",
        element: <App />, // Halaman Utama (Daftar Resep)
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/recipe/:id", // Halaman Detail Resep
        element: <RecipeDetail />,
      },
      
      // --- Rute Terproteksi (Hanya user yang sudah login) ---
      {
        element: <ProtectedRoute />, // "Penjaga" akan mengecek login
        children: [
          // Semua rute di dalam sini akan dilindungi
          {
            path: "/create-recipe",
            element: <CreateRecipe />,
          },
          {
            path: "/edit-recipe/:id",
            element: <EditRecipe />,
          },
          // Anda bisa tambahkan rute terproteksi lain di sini
          // {
          //   path: "/my-profile",
          //   element: <MyProfile />,
          // },
        ]
      }
    ]
  },
]);

// --- Render Aplikasi ---
// Perhatikan: <AuthProvider> membungkus <RouterProvider>
// Ini agar status login tersedia untuk semua halaman.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);