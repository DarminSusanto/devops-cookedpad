// /service-interactions/index.js

const express = require('express');
const mongoose = require('mongoose');
const Comment = require('./models/Comment'); // Import model Comment
const cors = require('cors')

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cors());

// --- Koneksi ke Database MongoDB ---
const DB_URI = 'mongodb://mongo-db:27017/db_resep';

mongoose.connect(DB_URI)
  // (PESAN LOG YANG BENAR)
  .then(() => console.log('Interaction-Service terhubung ke MongoDB (di Docker)'))
  .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

// --- Endpoint / Rute API ---

// (PESAN LOG YANG BENAR)
app.get('/', (req, res) => {
  res.send('Selamat datang di Interaction Service (API)! (Komen & Like)');
});

/**
 * @route GET /recipes/:recipeId/comments
 * @desc Mendapatkan semua komentar untuk satu resep
 */
app.get('/recipes/:recipeId/comments', async (req, res) => {
  try {
    const { recipeId } = req.params;
    
    // Cari semua komentar yang memiliki 'recipe' ID yang cocok
    const comments = await Comment.find({ recipe: recipeId });
    
    res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route POST /recipes/:recipeId/comments
 * @desc Menambahkan komentar baru ke resep
 */
app.post('/recipes/:recipeId/comments', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { text, userId } = req.body; // Ambil teks dan ID user

    if (!text || !userId) {
      return res.status(400).json({ message: 'Teks komentar dan userId harus diisi' });
    }

    const newComment = new Comment({
      recipe: recipeId,
      user: userId,
      text: text
    });

    // Simpan ke database
    await newComment.save();

    // Buka MongoDB Compass, Anda akan lihat collection 'comments' baru!
    res.status(201).json({ message: 'Komentar berhasil ditambahkan', comment: newComment });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


// --- Menjalankan Server ---
app.listen(PORT, () => {
  // (PESAN LOG YANG BENAR)
  console.log(`Interaction-Service (service-interactions) berjalan di port ${PORT}`);
});