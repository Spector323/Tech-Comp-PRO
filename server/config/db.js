const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Подключились к MongoDB');
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error.message);
    process.exit(1); 
  }
};

module.exports = connectDB;