// /service-recipes/index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Recipe = require('./models/Recipe');
const auth = require('./auth'); // <-- 1. IMPORT PENJAGA GERBANG

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cors());

// --- Koneksi Database ---
const DB_URI = 'mongodb://mongo-db:27017/db_resep';
mongoose.connect(DB_URI)
  .then(() => console.log('Recipe-Service terhubung ke MongoDB (di Docker)'))
  .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

// --- Endpoint / Rute API ---

app.get('/', (req, res) => {
  res.send('Selamat datang di Recipe Service (API)!');
});

/**
 * @route GET /recipes
 * @desc Mendapatkan semua resep (Publik)
 */
app.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('user', 'email'); // Ambil resep + email pembuatnya
    res.status(200).json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route POST /recipes
 * @desc Membuat resep baru (TERPROTEKSI)
 */
//              Perhatikan 'auth' di sini! vvvv
app.post('/recipes', auth, async (req, res) => { // <-- 2. TAMBAHKAN 'auth'
  try {
    const { title, description, ingredients, instructions } = req.body;

    if (!title || !ingredients || !instructions) {
      return res.status(400).json({ message: 'Judul, bahan, dan instruksi harus diisi' });
    }

    // 3. Ambil ID user DARI TOKEN, bukan dari body
    const userId = req.user.id; 

    const newRecipe = new Recipe({
      title,
      description,
      ingredients,
      instructions,
      user: userId // <-- Simpan ID user yang sudah terverifikasi
    });

    await newRecipe.save();
    res.status(201).json({ message: 'Resep baru berhasil disimpan', recipe: newRecipe });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route DELETE /recipes/:id
 * @desc Menghapus resep (TERPROTEKSI, HANYA PEMILIK)
 */
app.delete('/recipes/:id', auth, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.id; // ID dari user yang sedang login (dari token)

    // 1. Cari resepnya
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }

    // 2. Cek Kepemilikan (PENTING!)
    // 'recipe.user' adalah ObjectId, 'userId' adalah string.
    // Kita harus konversi salah satunya agar bisa dibandingkan.
    if (recipe.user.toString() !== userId) {
      return res.status(401).json({ message: 'Akses ditolak. Anda bukan pemilik resep ini.' });
    }

    // 3. Jika lolos, hapus resepnya
    await Recipe.findByIdAndDelete(recipeId);

    // (OPSIONAL: Hapus juga semua komentar terkait di service-interactions)
    // (Ini bisa jadi fitur lanjutan untuk Anda)

    res.status(200).json({ message: 'Resep berhasil dihapus' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route PUT /recipes/:id
 * @desc Mengedit/memperbarui resep (TERPROTEKSI, HANYA PEMILIK)
 */
app.put('/recipes/:id', auth, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.id; // ID dari user yang sedang login

    // 1. Ambil data baru dari body request
    const { title, description, ingredients, instructions } = req.body;

    // 2. Cari resepnya di database
    let recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }

    // 3. Cek Kepemilikan (Sama seperti DELETE)
    if (recipe.user.toString() !== userId) {
      return res.status(401).json({ message: 'Akses ditolak. Anda bukan pemilik resep ini.' });
    }

    // 4. Perbarui resep dengan data baru
    recipe = await Recipe.findByIdAndUpdate(
      recipeId,
      { $set: { title, description, ingredients, instructions } }, // Data baru
      { new: true } // Opsi ini agar Mongoose mengembalikan dokumen yang sudah diperbarui
    );

    res.status(200).json({ message: 'Resep berhasil diperbarui', recipe });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- Menjalankan Server ---
app.listen(PORT, () => {
  console.log(`Recipe-Service (service-recipes) berjalan di port ${PORT}`);
});