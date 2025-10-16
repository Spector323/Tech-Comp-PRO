const User = require('../models/User');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Все обязательные поля должны быть заполнены'
      });
    }

    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Введите корректный email'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Пароль должен содержать минимум 6 символов'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует'
      });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone: phone || ''
    });

    const savedUser = await user.save();

    const token = jwt.sign(
      { userId: savedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    const userResponse = {
      id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      phone: savedUser.phone,
      role: savedUser.role,
      avatar: savedUser.avatar,
      createdAt: savedUser.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует'
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при регистрации'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email и пароль обязательны'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Неверный email или пароль'
      });
    }

    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Неверный email или пароль'
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      message: 'Вход выполнен успешно',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при входе'
    });
  }
};

module.exports = { register, login };