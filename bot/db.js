const mongoose = require('mongoose');
const uri = "mongodb+srv://abdukarimovdevs:<db_password>@cluster0.nyklckf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function connectDB() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB ulandi');
  } catch (err) {
    console.error('❌ MongoDB ulanishda xatolik:', err.message);
  }
}

module.exports = connectDB;
