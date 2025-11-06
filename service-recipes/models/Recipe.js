// /service-recipes/models/Recipe.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId, // Ini adalah 'foreign key'
    ref: 'User' // Merujuk ke model 'User' yang ada di service-users
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  ingredients: [{
    type: String // Ini adalah array of strings
  }],
  instructions: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Recipe', RecipeSchema);