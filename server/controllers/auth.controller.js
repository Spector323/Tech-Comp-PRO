const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// crypto - для генерации случайных токенов
const { sendVerificationEmail } = require('../utils/emailService');
// sendVerificationEmail - функция отправки email

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
  // Генерируем случайный токен из 64 символов
}

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
      phone: phone || '',
      emailVerificationToken: generateVerificationToken(),
      // Генерируем токен подтверждения
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000
      // Токен действует 24 часа
    });

    const savedUser = await user.save();

    // Отправляем письмо с подтверждением
    await sendVerificationEmail(email, savedUser.emailVerificationToken);

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
      emailVerified: savedUser.emailVerified,
      // Добавляем статус подтверждения email
      createdAt: savedUser.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован. Проверьте email для подтверждения.',
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
      emailVerified: user.emailVerified,
      // Добавляем статус подтверждения email
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

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    // Получаем токен из URL

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
      // Ищем пользователя с действующим токеном
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Неверный или просроченный токен подтверждения'
      });
    }

    user.emailVerified = true;
    // Подтверждаем email
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    // Удаляем использованный токен

    await user.save();

    res.json({
      success: true,
      message: 'Email успешно подтвержден!'
    });
  } catch (error) {
    console.error('Ошибка подтверждения email:', error);
    res.status(500).json({
      success: false, 
      message: 'Ошибка подтверждения email'
    });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь с таким email не найден'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false, 
        message: 'Email уже подтвержден'
      });
    }

    user.emailVerificationToken = generateVerificationToken();
    // Генерируем новый токен
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    // Устанавливаем новое время жизни

    await user.save();

    await sendVerificationEmail(email, user.emailVerificationToken);
    // Отправляем письмо с новым токеном

    res.json({
      success: true,
      message: 'Письмо с подтверждением отправлено повторно'
    });
  } catch (error) {
    console.error('Ошибка повторной отправки:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при отправке письма'
    });
  }
};

module.exports = { register, login, verifyEmail, resendVerification };