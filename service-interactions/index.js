// /service-interactions/index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Comment = require('./models/Comment'); // Import model Comment
const auth = require('./auth'); // Import "Penjaga Gerbang" (Middleware)

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cors()); // Terapkan CORS untuk semua rute

// --- Koneksi Database ---
const DB_URI = 'mongodb://mongo-db:27017/db_resep';
mongoose.connect(DB_URI)
  .then(() => console.log('Interaction-Service terhubung ke MongoDB (di Docker)'))
  .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

// --- Endpoint / Rute API ---

app.get('/', (req, res) => {
  res.send('Selamat datang di Interaction Service (API)! (Komen & Like)');
});

/**
 * @route GET /recipes/:recipeId/comments
 * @desc Mendapatkan semua komentar untuk satu resep (Publik)
 */
app.get('/recipes/:recipeId/comments', async (req, res) => {
  try {
    const { recipeId } = req.params;
    
    // Cari semua komentar yang memiliki 'recipe' ID yang cocok
    // .populate('user', 'email') = Ambil juga info email dari user yang komen
    // .sort({ createdAt: 1 }) = Urutkan dari yang terlama (format chat)
    const comments = await Comment.find({ recipe: recipeId })
      .populate('user', 'email')
      .sort({ createdAt: 1 });
    
    res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route POST /recipes/:recipeId/comments
 * @desc Menambahkan komentar baru ke resep (TERPROTEKSI)
 */
app.post('/recipes/:recipeId/comments', auth, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { text } = req.body; // Ambil teks komentar dari body
    const userId = req.user.id; // Ambil ID user dari token (setelah lolos 'auth')

    if (!text) {
      return res.status(400).json({ message: 'Teks komentar harus diisi' });
    }

    const newComment = new Comment({
      recipe: recipeId,
      user: userId,
      text: text
    });

    // Simpan ke database
    await newComment.save();
    
    // Ambil kembali komentar yang baru disimpan + data user-nya
    const populatedComment = await Comment.findById(newComment._id).populate('user', 'email');

    // Kirim komentar baru itu ke frontend agar bisa langsung ditampilkan
    res.status(201).json({ message: 'Komentar berhasil ditambahkan', comment: populatedComment });

  } catch (err)
 {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route DELETE /comments/:id
 * @desc Menghapus komentar (TERPROTEKSI, HANYA PEMILIK KOMENTAR)
 * @note Perhatikan, rutenya /comments/:id, BUKAN /recipes/:recipeId/comments/:id
 */
app.delete('/comments/:id', auth, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id; // ID dari user yang sedang login

    // 1. Cari komentarnya
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Komentar tidak ditemukan' });
    }

    // 2. Cek Kepemilikan (Hanya yang nulis yang boleh hapus)
    // PERINGATAN: Nanti kita bisa tambahkan logika agar PEMILIK RESEP juga bisa hapus
    if (comment.user.toString() !== userId) {
      return res.status(401).json({ message: 'Akses ditolak. Anda bukan pemilik komentar ini.' });
    }

    // 3. Jika lolos, hapus komentarnya
    await Comment.findByIdAndDelete(commentId);
    
    res.status(200).json({ message: 'Komentar berhasil dihapus' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


// --- Menjalankan Server ---
app.listen(PORT, () => {
  console.log(`Interaction-Service (service-interactions) berjalan di port ${PORT}`);
});