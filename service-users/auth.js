// /service-users/auth.js

const jwt = require('jsonwebtoken');
// Rahasia ini HARUS SAMA PERSIS dengan yang ada di service-users
const JWT_SECRET = 'rahasia-uts-devops-kelompok-anda';

module.exports = function(req, res, next) {
  // 1. Ambil token dari header request
  const token = req.header('x-auth-token');

  // 2. Cek jika tidak ada token
  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak. Tidak ada token.' });
  }

  // 3. Verifikasi token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // 4. Jika token valid, simpan info user ke 'req'
    // 'decoded.user' berasal dari 'payload' yang kita buat di service-users
    req.user = decoded.user; 

    // 5. Lanjutkan ke endpoint (misal: /create-recipe)
    next(); 
  } catch (err) {
    res.status(401).json({ message: 'Token tidak valid.' });
  }
};