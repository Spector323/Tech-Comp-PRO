const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Нет токена, доступ запрещён' });
    }
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Токен недействителен' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Токен недействителен' });
  }
};

module.exports = auth;