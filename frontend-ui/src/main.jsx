// /frontend-ui/src/main.jsx

import React from 'react';
// ... import lainnya ...
import App from './App.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import CreateRecipe from './pages/CreateRecipe.jsx'; // <-- IMPORT HALAMAN BARU
import './index.css';

// ... (kode AppLayout Anda SAMA) ...

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      // ... (rute '/' , '/register', '/login' SAMA) ...
      {
        path: "/login",
        element: <Login />,
      },
      // TAMBAHKAN RUTE INI:
      {
        path: "/create-recipe",
        element: <CreateRecipe />, 
      },
    ]
  },
]);

// ... (sisa kode Anda SAMA) ...