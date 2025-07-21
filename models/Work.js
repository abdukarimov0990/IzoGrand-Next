const mongoose = require('mongoose');

const WorkSchema = new mongoose.Schema({
  name: String,
  desc: String,
  img: [String], // Rasmlar ro'yxati
});

module.exports = mongoose.model('Work', WorkSchema);
