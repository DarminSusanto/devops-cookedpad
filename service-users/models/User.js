// /service-users/models/User.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Pastikan email tidak ada yang sama
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true }); // Menambahkan createdAt dan updatedAt otomatis

// 'User' akan menjadi collection 'users' di MongoDB
module.exports = mongoose.model('User', UserSchema);