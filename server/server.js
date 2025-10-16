const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Подключение к БД
const connectDB = require('./config/db');

// Middleware
const errorHandler = require('./middleware/errorHandler');

// Роуты
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

// Подключаемся к БД
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы (аватары)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API роуты
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// Тестовый эндпоинт
app.get('/api/test', (req, res) => {
  res.json({ message: 'Сервер работает!' });
});

// Централизованный обработчик ошибок (должен быть в самом конце)
app.use(errorHandler);

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});