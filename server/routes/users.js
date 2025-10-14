// Роуты для работы с пользователями - ИСПРАВЛЕННАЯ ВЕРСИЯ
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

//  Используем общий middleware
const auth = require('../middleware/auth');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  }, //  Запятая после destination
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

//  Роут для загрузки аватара
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Файл не выбран'
      });
    }

    //  Создаем URL для аватара
    const avatarUrl = `http://localhost:3000/uploads/${req.file.filename}`;

    //   Получаем текущего пользователя для удаления старого аватара
    const user = await User.findById(req.user.id);
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar); // Путь к старому файлу
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath); // Удаляем старый файл
        console.log(`Старый аватар удален: ${oldAvatarPath}`);
      }
    }

    //  Обновляем пользователя в базе
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

//  Получить всех пользователей (только для админа)
router.get('/admin/users', auth, async (req, res) => {
  try {
    // Проверяем права доступа
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен'
      });
    }

    const users = await User.find()
      .select('-password') // Исключаем пароль
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка загрузки пользователей'
    });
  }
});

//  Создать пользователя (админ)
router.post('/admin/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен'
      });
    }

    const { firstName, lastName, email, password, phone, role, specialization } = req.body;

    // Проверяем обязательные поля
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Все обязательные поля должны быть заполнены'
      });
    }

    // Проверяем email на уникальность
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует'
      });
    }

    // Создаем пользователя
    const user = new User({
      firstName,
      lastName,
      email,
      password, // Автоматически хешируется в модели
      phone: phone || '',
      role,
      specialization: role === 'master' ? specialization : ''
    });

    const savedUser = await user.save();

    // Убираем пароль из ответа
    const userResponse = {
      _id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      phone: savedUser.phone,
      role: savedUser.role,
      specialization: savedUser.specialization,
      isActive: savedUser.isActive,
      avatar: savedUser.avatar,
      createdAt: savedUser.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно создан',
      user: userResponse
    });

  } catch (error) {
    console.error('Ошибка создания пользователя:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Ошибка создания пользователя'
    });
  }
});

//  Обновить роль пользователя (админ)
router.patch('/admin/users/:id/role', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен'
      });
    }

    const { role, specialization } = req.body;
    const userId = req.params.id;

    // Нельзя изменить свою роль
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Нельзя изменить свою роль'
      });
    }

    const updateData = { role };
    if (role === 'master') {
      updateData.specialization = specialization || '';
    } else {
      updateData.specialization = '';
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    res.json({
      success: true,
      message: 'Роль пользователя обновлена',
      user: updatedUser
    });

  } catch (error) {
    console.error('Ошибка обновления роли:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления роли'
    });
  }
});

//  Переключить статус пользователя (админ)
router.patch('/admin/users/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен'
      });
    }

    const userId = req.params.id;

    // Нельзя изменить свой статус
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Нельзя изменить свой статус'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `Пользователь ${user.isActive ? 'активирован' : 'деактивирован'}`,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Ошибка изменения статуса:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка изменения статуса'
    });
  }
});

//  Удалить пользователя (админ)
router.delete('/admin/users/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен'
      });
    }

    const userId = req.params.id;

    // Нельзя удалить себя
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Нельзя удалить свой аккаунт'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Проверяем есть ли связанные заявки
    const userOrders = await Order.find({ user: userId });
    if (userOrders.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Нельзя удалить пользователя с активными заявками'
      });
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Пользователь успешно удален'
    });

  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка удаления пользователя'
    });
  }
});

module.exports = router;