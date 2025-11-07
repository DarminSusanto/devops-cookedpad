// /service-users/index.js

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // <-- Pastikan cors di-import
const User = require('./models/User');
const auth = require('./auth'); // <-- 1. IMPORT PENJAGA GERBANG

const app = express();
const PORT = 3000;
app.use(express.json()); // Middleware untuk membaca body JSON
app.use(cors());

// --- Koneksi ke Database MongoDB ---
const DB_URI = 'mongodb://mongo-db:27017/db_resep';
// Rahasia untuk token Anda, buatlah yang unik
const JWT_SECRET = 'rahasia-uts-devops-kelompok-anda';

mongoose.connect(DB_URI)
  .then(() => console.log('User-Service terhubung ke MongoDB (di Docker)'))
  .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

// --- Endpoint / Rute API ---

app.get('/', (req, res) => {
  res.send('Selamat datang di User Service (API) v2.0!');
});

/**
 * @route POST /register
 * @desc Mendaftarkan user baru
 */

/**
 * @route GET /me
 * @desc Mendapatkan data user yang sedang login (via token)
 * @access Private
 */
app.get('/me', auth, async (req, res) => {
  // 'auth' adalah penjaga gerbang. Jika kode sampai di sini,
  // berarti token-nya valid dan kita punya 'req.user'.
  
  try {
    // Kita tidak mau kirim password, jadi kita select '-password'
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.json(user); // Kirim data user (id, email, createdAt)
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Cek input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password harus diisi' });
    }

    // 2. Cek apakah user sudah ada
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // 3. Enkripsi password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Buat user baru
    user = new User({
      email,
      password: hashedPassword
    });

    // 5. Simpan ke database
    await user.save();
    
    // Tes di MongoDB Compass, user baru akan muncul!
    res.status(201).json({ message: 'User berhasil didaftarkan' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route POST /login
 * @desc Login user dan mengembalikan token JWT
 */
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Cek user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    // 2. Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    // 3. Buat Token (Payload)
    const payload = {
      user: {
        id: user.id, // Ini adalah ID unik dari MongoDB
        email: user.email
      }
    };

    // 4. Buat dan kirim token
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' }, // Token berlaku selama 1 jam
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token }); // Kirim token ke frontend
      }
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- Menjalankan Server ---
app.listen(PORT, () => {
  console.log(`User-Service (service-users) berjalan di port ${PORT}`);
});