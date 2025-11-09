// /service-upload/index.js

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3004; // upload service runs on 3004

app.use(cors());

// --- Setup Folder Upload ---
// Pastikan folder 'uploads' ada
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// --- Buat 'uploads' menjadi Static Folder ---
// Ini adalah KUNCI agar browser bisa mengakses gambar
// Cth: http://localhost:3004/uploads/namafile.jpg
app.use('/uploads', express.static(uploadDir));

// --- Konfigurasi Multer (Penyimpanan) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Simpan file ke folder 'uploads'
  },
  filename: (req, file, cb) => {
    // Buat nama file unik (cth: 1678886400000.jpg)
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ storage: storage });

// --- Endpoint / Rute API ---

app.get('/', (req, res) => {
  res.send('Selamat datang di Upload Service! (API)');
});

/**
 * @route POST /upload
 * @desc Upload satu file gambar
 * @note 'file' adalah nama field di form-data
 */
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang di-upload' });
    }

    // Buat URL lengkap ke file yang baru di-upload
    // PENTING: Port 3004 adalah port publik yang akan kita set di docker-compose
    const fileUrl = `http://localhost:3004/uploads/${req.file.filename}`;

    // Kirim URL ini kembali ke frontend
    res.status(200).json({
      message: 'File berhasil di-upload',
      url: fileUrl
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Upload-Service (service-upload) berjalan di port ${PORT}`);
});