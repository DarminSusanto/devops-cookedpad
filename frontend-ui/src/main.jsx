// /frontend-ui/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx'; // <-- IMPORT SIDEBAR
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Import Halaman
import App from './App.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import CreateRecipe from './pages/CreateRecipe.jsx';
import RecipeDetail from './pages/RecipeDetail.jsx';
import EditRecipe from './pages/EditRecipe.jsx';
import Profile from './pages/Profile.jsx';
import './index.css'; // Pastikan file ini berisi 3 baris @tailwind

/**
 * Komponen "Layout" BARU (ala Cookpad)
 * Ini adalah pembungkus 2 kolom Anda
 */
const AppLayout = () => (
  // Seluruh halaman, tinggi penuh
  <div className="app-root">
    <Navbar />
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <div className="container">
          <Outlet /> {/* halaman (App.jsx, dll) akan dimuat di sini */}
        </div>
      </main>
    </div>
  </div>
);

// --- Definisikan Rute (URL) Aplikasi Anda ---
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />, // Gunakan AppLayout sebagai elemen induk
    children: [
      { path: "/", element: <App /> },
      { path: "/register", element: <Register /> },
      { path: "/login", element: <Login /> },
      { path: "/recipe/:id", element: <RecipeDetail /> },
      {
        element: <ProtectedRoute />, // "Penjaga" Rute
        children: [
          { path: "/create-recipe", element: <CreateRecipe /> },
          { path: "/edit-recipe/:id", element: <EditRecipe /> },
          { path: "/profile", element: <Profile /> },
          // (Anda bisa tambahkan rute /my-recipes di sini)
        ]
      }
    ]
  },
]);

// --- Render Aplikasi ---
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);