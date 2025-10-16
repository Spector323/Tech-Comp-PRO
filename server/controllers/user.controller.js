const User = require('../models/User');
const Order = require('../models/Order');
const path = require('path');
const fs = require('fs');

// Загрузка аватара
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Файл не выбран'
      });
    }

    // Формируем относительный путь (без домена), чтобы не зависеть от localhost
    const avatarPath = `http://localhost:3000/uploads/${req.file.filename}`;

    // Удаляем старый аватар (если не дефолтный)
    const user = await User.findById(req.user.id);
    if (user.avatar && user.avatar !== '/avatar.png') {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Сохраняем новый путь
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarPath },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Аватар успешно обновлён',
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
};

// Получить профиль
const getProfile = async (req, res) => {
  try {
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
      message: 'Ошибка загрузки профиля'
    });
  }
};

// Обновить профиль
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Имя, фамилия и email обязательны'
      });
    }

    if (email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Пользователь с таким email уже существует'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, email, phone },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Профиль успешно обновлён',
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
      message: 'Ошибка обновления профиля'
    });
  }
};

// Админ: получить всех пользователей
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Доступ запрещён' });
    }
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error);
    res.status(500).json({ success: false, message: 'Ошибка загрузки пользователей' });
  }
};

// Админ: создать пользователя
const createUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Доступ запрещён' });
    }

    const { firstName, lastName, email, password, phone, role, specialization } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Все обязательные поля должны быть заполнены' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Пользователь с таким email уже существует' });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone: phone || '',
      role,
      specialization: role === 'master' ? specialization : ''
    });

    const savedUser = await user.save();

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно создан',
      user: {
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
      }
    });
  } catch (error) {
    console.error('Ошибка создания пользователя:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Ошибка создания пользователя' });
  }
};

// Админ: обновить роль
const updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Доступ запрещён' });
    if (req.params.id === req.user.id) return res.status(400).json({ success: false, message: 'Нельзя изменить свою роль' });

    const { role, specialization } = req.body;
    const updateData = { role, specialization: role === 'master' ? (specialization || '') : '' };

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!updatedUser) return res.status(404).json({ success: false, message: 'Пользователь не найден' });

    res.json({ success: true, message: 'Роль пользователя обновлена', user: updatedUser });
  } catch (error) {
    console.error('Ошибка обновления роли:', error);
    res.status(500).json({ success: false, message: 'Ошибка обновления роли' });
  }
};

// Админ: переключить статус
const toggleUserStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Доступ запрещён' });
    if (req.params.id === req.user.id) return res.status(400).json({ success: false, message: 'Нельзя изменить свой статус' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Пользователь не найден' });

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
    res.status(500).json({ success: false, message: 'Ошибка изменения статуса' });
  }
};

// Админ: удалить пользователя (с удалением аватара)
const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Доступ запрещён' });
    }
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Нельзя удалить свой аккаунт' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    // Проверка на наличие заявок
    const userOrders = await Order.find({ user: req.params.id });
    if (userOrders.length > 0) {
      return res.status(400).json({ success: false, message: 'Нельзя удалить пользователя с активными заявками' });
    }

    // 🔥 Удаляем аватар с диска, если он не дефолтный
    if (user.avatar && user.avatar !== '/avatar.png') {
      // Аватар хранится как URL вида: http://localhost:3000/uploads/123-123456789.jpg
      // Нам нужно извлечь только имя файла
      const avatarFilename = user.avatar.split('/').pop(); // Получаем "123-123456789.jpg"
      const avatarPath = path.join(__dirname, '..', 'uploads', avatarFilename);

      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
        console.log(`🗑️ Аватар удалён: ${avatarPath}`);
      }
    }

    // Удаляем пользователя из БД
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Пользователь успешно удалён' });
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    res.status(500).json({ success: false, message: 'Ошибка удаления пользователя' });
  }
};

module.exports = {
  uploadAvatar,
  getProfile,
  updateProfile,
  getAllUsers,
  createUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser
};