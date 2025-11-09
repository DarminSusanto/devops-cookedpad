// /service-recipes/index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Recipe = require('./models/Recipe'); // Import model Recipe
const auth = require('./auth'); // Import "Penjaga Gerbang" (Middleware)

const app = express();
const PORT = 3002;
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
 * @note .sort({ createdAt: -1 }) = tampilkan yang terbaru dulu
 */
app.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate('user', 'email') // Ambil resep + email pembuatnya
      .sort({ createdAt: -1 }); 
    res.status(200).json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route GET /recipes/search
 * @desc Mencari resep berdasarkan judul (?q=...) (Publik)
 * @note Rute ini harus ada SEBELUM '/recipes/:id' agar 'search' tidak dianggap ID
 */
app.get('/recipes/search', async (req, res) => {
  try {
    const query = req.query.q; // Ambil kata kunci dari URL ?q=nasi

    if (!query) {
      return res.status(400).json({ message: "Masukkan kata kunci pencarian" });
    }

    // Cari resep yang judulnya mengandung 'query', 'i' = case-insensitive
    const recipes = await Recipe.find({
      title: { $regex: query, $options: 'i' } 
    }).populate('user', 'email');
    
    res.status(200).json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route GET /recipes/:id
 * @desc Mendapatkan SATU resep berdasarkan ID (Publik)
 */
app.get('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('user', 'email');
    if (!recipe) {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }
    res.status(200).json(recipe);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route POST /recipes
 * @desc Membuat resep baru (TERPROTEKSI)
 */
app.post('/recipes', auth, async (req, res) => { // <-- 'auth' middleware
  try {
    const { title, description, ingredients, instructions } = req.body;
    const userId = req.user.id; // Ambil ID user dari token (setelah lolos 'auth')

    if (!title || !ingredients || !instructions) {
      return res.status(400).json({ message: 'Judul, bahan, dan instruksi harus diisi' });
    }

    const newRecipe = new Recipe({
      title,
      description,
      ingredients,
      instructions,
      user: userId // Simpan ID user yang sudah terverifikasi
    });

    await newRecipe.save();
    const populatedRecipe = await Recipe.findById(newRecipe._id).populate('user', 'email');
    res.status(201).json({ message: 'Resep baru berhasil disimpan', recipe: populatedRecipe });

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
    const userId = req.user.id;
    const { title, description, ingredients, instructions } = req.body;

    let recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: 'Resep tidak ditemukan' });

    // Cek Kepemilikan
    if (recipe.user.toString() !== userId) {
      return res.status(401).json({ message: 'Akses ditolak. Anda bukan pemilik.' });
    }

    // Update resep
    recipe = await Recipe.findByIdAndUpdate(
      recipeId,
      { $set: { title, description, ingredients, instructions } },
      { new: true } // Mengembalikan dokumen yang sudah di-update
    ).populate('user', 'email');

    res.status(200).json({ message: 'Resep berhasil diperbarui', recipe });
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
    const userId = req.user.id;

    let recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: 'Resep tidak ditemukan' });

    // Cek Kepemilikan
    if (recipe.user.toString() !== userId) {
      return res.status(401).json({ message: 'Akses ditolak. Anda bukan pemilik.' });
    }

    await Recipe.findByIdAndDelete(recipeId);
    
    // TODO: Idealnya, panggil service-interactions untuk menghapus semua
    // komentar yang terkait dengan resep ini.
    
    res.status(200).json({ message: 'Resep berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});



// --- Menjalankan Server ---
app.listen(PORT, () => {
  console.log(`Recipe-Service (service-recipes) berjalan di port ${PORT}`);
});

/**
 * Tambahan: route untuk mendapatkan resep milik user tertentu
 * @route GET /recipes/user/:userId
 * @desc Mendapatkan semua resep yang dibuat oleh satu user
 */
app.get('/recipes/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const recipes = await Recipe.find({ user: userId }).populate('user', 'email').sort({ createdAt: -1 });
    res.status(200).json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});