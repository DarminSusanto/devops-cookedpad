// /service-recipes/index.js

const express = require('express');
const mongoose = require('mongoose');
const Recipe = require('./models/Recipe'); // Import model Recipe
const cors = require('cors')

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cors());

// --- Koneksi ke Database MongoDB ---
const DB_URI = 'mongodb://mongo-db:27017/db_resep';

mongoose.connect(DB_URI)
  // (PESAN LOG YANG BENAR)
  .then(() => console.log('Recipe-Service terhubung ke MongoDB (di Docker)'))
  .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

// --- Endpoint / Rute API ---

// (PESAN LOG YANG BENAR)
app.get('/', (req, res) => {
  res.send('Selamat datang di Recipe Service (API)!');
});

/**
 * @route GET /recipes
 * @desc Mendapatkan semua resep
 */
app.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find(); // Cari semua resep
    res.status(200).json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route POST /recipes
 * @desc Membuat resep baru
 */
app.post('/recipes', async (req, res) => {
  try {
    const { title, description, ingredients, instructions, userId } = req.body;

    // 1. Cek input dasar
    if (!title || !ingredients || !instructions) {
      return res.status(400).json({ message: 'Judul, bahan, dan instruksi harus diisi' });
    }

    // 2. Buat resep baru
    // (CATATAN: Nanti kita akan dapat userId dari token, 
    // untuk sekarang kita kirim manual saja)
    const newRecipe = new Recipe({
      title,
      description,
      ingredients,
      instructions,
      user: userId // Nanti ini akan kita perbaiki
    });

    // 3. Simpan ke database
    await newRecipe.save();

    // Buka MongoDB Compass, Anda akan lihat collection 'recipes' baru!
    res.status(201).json({ message: 'Resep baru berhasil disimpan', recipe: newRecipe });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


// --- Menjalankan Server ---
app.listen(PORT, () => {
  // (PESAN LOG YANG BENAR)
  console.log(`Recipe-Service (service-recipes) berjalan di port ${PORT}`);
});