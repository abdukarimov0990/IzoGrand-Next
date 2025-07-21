const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  desc: String,
  img: [String], // Rasmlar ro'yxati
});

module.exports = mongoose.model('Product', ProductSchema);
