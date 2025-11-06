// /frontend-ui/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute'; // <-- 1. IMPORT PROTECTED ROUTE

// Import Halaman Anda
import App from './App.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import CreateRecipe from './pages/CreateRecipe.jsx';
import RecipeDetail from './pages/RecipeDetail.jsx';
import './index.css';

// Komponen "Layout" (Navbar + Halaman)
const AppLayout = () => (
  <div className="min-h-screen bg-gray-900">
    <Navbar />
    <main>
      <Outlet />
    </main>
  </div>
);

// Definisikan rute (URL) Anda
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />, // Gunakan AppLayout sebagai pembungkus
    children: [
      // --- Rute Publik (Semua orang bisa lihat) ---
      {
        path: "/",
        element: <App />,
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
        path: "/recipe/:id",
        element: <RecipeDetail />,
      },
      
      // --- Rute Terproteksi (Hanya user login) ---
      {
        element: <ProtectedRoute />, // <-- 2. GUNAKAN 'PENJAGA'
        children: [
          // 3. Masukkan semua rute yang butuh login DI DALAM SINI
          {
            path: "/create-recipe",
            element: <CreateRecipe />,
          },
          // Nanti kita bisa tambahkan rute lain di sini,
          // seperti /my-recipes atau /edit-recipe/:id
        ]
      }
    ]
  },
]);

// Render aplikasi
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);