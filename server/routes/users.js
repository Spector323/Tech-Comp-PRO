// Роуты для работы с пользователями - РАБОЧАЯ ВЕРСИЯ
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ ИСПРАВЛЕНО: Используем общий middleware
const auth = require('../middleware/auth');

// ✅ Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/avatars/';
    // Создаем папку если не существует
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Создаем уникальное имя файла: userId + timestamp + extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены!'), false);
    }
  }
});

// ✅ Роут для загрузки аватара
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Файл не выбран'
      });
    }

    // ✅ Создаем URL для аватара
    const avatarUrl = `uploads/avatars/${req.file.filename}`;

    // ✅ Обновляем пользователя в базе
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Аватар успешно обновлен',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        createdAt: updatedUser.createdAt
      }
    });

  } catch (error) {
    console.error('Ошибка загрузки аватара:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка загрузки аватара'
    });
  }
});

// Получить профиль текущего пользователя
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('Запрос профиля для пользователя:', req.user.email);
    
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
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка загрузки профиля',
      error: error.message
    });
  }
});

// Обновить профиль
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    console.log('Обновление профиля:', { firstName, lastName, email, phone });

    // Проверяем обязательные поля
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Имя, фамилия и email обязательны'
      });
    }

    // Проверяем email на уникальность (если меняется)
    if (email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Пользователь с таким email уже существует'
        });
      }
    }

    // Обновляем пользователя
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, email, phone },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Профиль успешно обновлен',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        createdAt: updatedUser.createdAt
      }
    });

  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления профиля',
      error: error.message
    });
  }
});

module.exports = router;