// Роуты для авторизации - РАБОЧАЯ ВЕРСИЯ С БД
const express = require('express')
const router = express.Router()
const User = require('../models/User')
const jwt = require('jsonwebtoken') // ✅ ДОБАВЛЕНО

// Регистрация - РАБОЧАЯ ВЕРСИЯ
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body

    console.log('Получены данные регистрации:', { firstName, lastName, email, phone })

    // Проверяем обязательные поля
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Все обязательные поля должны быть заполнены'
      })
    }

    // Проверяем email
    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Введите корректный email'
      })
    }

    // Проверяем длину пароля
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Пароль должен содержать минимум 6 символов'
      })
    }

    // Проверяем нет ли пользователя с таким email
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует'
      })
    }

    // Создаем пользователя (пароль автоматически хешируется в модели)
    const user = new User({
      firstName,
      lastName,
      email,
      password, // Модель сама захеширует пароль
      phone: phone || ''
    })

    // Сохраняем в базу данных
    const savedUser = await user.save()
    console.log('Пользователь сохранен в БД:', savedUser._id)

    // ✅ ИСПРАВЛЕНО: Генерируем НАСТОЯЩИЙ JWT токен
    const token = jwt.sign(
      { userId: savedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    )

    // Убираем пароль из ответа
    const userResponse = {
      id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      phone: savedUser.phone,
      role: savedUser.role,
      avatar: savedUser.avatar,
      createdAt: savedUser.createdAt
    }

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      user: userResponse,
      token: token
    })

  } catch (error) {
    console.error('Ошибка регистрации:', error)
    
    // Обработка ошибок MongoDB
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует'
      })
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при регистрации',
      error: error.message
    })
  }
})

// Вход - РАБОЧАЯ ВЕРСИЯ
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    console.log('Попытка входа:', email)

    // Проверяем обязательные поля
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email и пароль обязательны'
      })
    }

    // Находим пользователя и включаем пароль для проверки
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Неверный email или пароль'
      })
    }

    // Проверяем пароль
    const isPasswordValid = await user.checkPassword(password)
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Неверный email или пароль'
      })
    }

    // ✅ ИСПРАВЛЕНО: Генерируем НАСТОЯЩИЙ JWT токен
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    )

    // Убираем пароль из ответа
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt
    }

    res.json({
      success: true,
      message: 'Вход выполнен успешно',
      user: userResponse,
      token: token
    })

  } catch (error) {
    console.error('Ошибка входа:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при входе',
      error: error.message
    })
  }
})

module.exports = router