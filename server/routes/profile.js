const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { restrictTo } = require('../middleware/root');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Настройка Multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Только изображения JPEG/PNG!'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // Ограничение 5 МБ
});

// Получить данные профиля
router.get('/me', restrictTo('client', 'admin', 'manager', 'master'), async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить имя, фамилию и телефон
router.patch('/me', restrictTo('client', 'admin', 'manager', 'master'), async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  if (!firstName || !lastName) {
    return res.status(400).json({ message: 'Имя и фамилия обязательны' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, phone },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Загрузка аватара
router.post('/avatar', restrictTo('client', 'admin', 'manager', 'master'), upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatar: avatarPath },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Ошибка загрузки аватара' });
  }
});

module.exports = router;