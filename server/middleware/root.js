const jwt = require('jsonwebtoken');

const restrictTo = (...roles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Токен отсутствует' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Доступ запрещён: недостаточно прав' });
      }
      req.userId = decoded.userId;
      req.userRole = decoded.role; // Сохраняем роль для использования в маршрутах
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Неверный токен' });
    }
  };
};

module.exports = { restrictTo };