// Middleware для проверки JWT токена

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Получаем токен из заголовка
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Нет токена, доступ запрещен' 
      });
    }

    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Находим пользователя
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        message: 'Токен недействителен' 
      });
    }

    // Добавляем пользователя в запрос
    req.user = user;
    next();

  } catch (error) {
    res.status(401).json({ 
      message: 'Токен недействителен' 
    });
  }
};

module.exports = auth;