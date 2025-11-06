// /service-interactions/models/Comment.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  // Tautan ke resep mana komentar ini berada
  recipe: {
    type: Schema.Types.ObjectId,
    ref: 'Recipe', // Merujuk ke model 'Recipe'
    required: true
  },
  // Tautan ke siapa yang membuat komentar
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Merujuk ke model 'User'
    required: true
  },
  // Isi komentarnya
  text: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);