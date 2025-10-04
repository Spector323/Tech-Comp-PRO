const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Импорт роутов
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Статическая папка для аватаров
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Подключение к MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Успешно подключились к MongoDB'))
  .catch((error) => console.error('❌ Ошибка подключения:', error));

// Роуты
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);

// Главная страница
app.get('/', (req, res) => {
  res.send('Сервер аутентификации работает!');
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});