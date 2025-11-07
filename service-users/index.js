// /service-users/index.js

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Untuk enkripsi password
const jwt = require('jsonwebtoken'); // Untuk membuat/membaca token
const cors = require('cors'); // Untuk mengizinkan koneksi dari frontend
const User = require('./models/User'); // Import model User
const auth = require('./auth'); // Import "Penjaga Gerbang" (Middleware)

const app = express();
const PORT = 3000;
app.use(express.json()); // Middleware untuk membaca body JSON
app.use(cors()); // Terapkan CORS untuk semua rute

// --- Koneksi ke Database MongoDB ---
// Nama host 'mongo-db' adalah nama service di docker-compose.yml
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
 * @desc Mendaftarkan user baru (Publik)
 */
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
    
    res.status(201).json({ message: 'User berhasil didaftarkan' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route POST /login
 * @desc Login user dan mengembalikan token JWT (Publik)
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


/**
 * @route GET /me
 * @desc Mendapatkan data user yang sedang login (via token)
 * @access Private (Butuh token)
 */
app.get('/me', auth, async (req, res) => {
  // 'auth' adalah penjaga gerbang. Jika lolos, kita punya 'req.user'.
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

/**
 * @route GET /user/:id
 * @desc Mendapatkan data profil user secara publik (tanpa password)
 * @access Public
 */
app.get('/user/:id', async (req, res) => {
  try {
    // Cari user berdasarkan ID dari URL
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    // Kirim data user (id, email, createdAt)
    res.json(user);
  } catch (err) {
    console.error(err);
    // Jika ID tidak valid
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route PUT /me
 * @desc Update info profil user (displayName, bio)
 * @access Private
 */
app.put('/me', auth, async (req, res) => {
  try {
    const { displayName, bio } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, // Ambil ID dari token
      { $set: { displayName, bio } }, // Data baru
      { new: true } // Kembalikan dokumen yang sudah baru
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- Menjalankan Server ---
app.listen(PORT, () => {
  console.log(`User-Service (service-users) berjalan di port ${PORT}`);
});