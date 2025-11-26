const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

//  ПРАВИЛЬНЫЙ CORS для Vite разработки
app.use(cors({
  origin: 'http://localhost:5173', // Порт Vite
  credentials: true
}));

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  СОЗДАЕМ ПАПКУ uploads при запуске
const uploadsDir = path.join(__dirname, 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(' Папка uploads создана');
}

app.use('/uploads', express.static(uploadsDir));

//  ДОБАВЛЯЕМ ПРОПУЩЕННЫЙ ENDPOINT
app.get('/api/auth/me', require('./middleware/auth'), (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      avatar: req.user.avatar,
      createdAt: req.user.createdAt
    }
  });
});

// Роуты
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Сервер работает!' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📱 CORS настроен для: http://localhost:5173`);
});