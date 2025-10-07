const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

// Импортируем роуты
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ ОБЯЗАТЕЛЬНО: Добавьте статические файлы ДО роутов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Подключаем роуты
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// Тестовый роут - проверяем что сервер работает
app.get('/api/test', (req, res) => {
  res.json({ message: 'Сервер работает!' });
});

// Подключение к базе данных
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Подключились к MongoDB');
  } catch (error) {
    console.log('❌ Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};

// Запуск сервера
const startServer = async () => {
  await connectDB();
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📚 API доступно по адресу: http://localhost:${PORT}/api`);
    console.log(`🖼️  Статические файлы: http://localhost:${PORT}/uploads`);
  });
};

startServer();