const errorHandler = (err, req, res, next) => {
  console.error('❌ Ошибка:', err.stack || err.message || err);
  // Определяем статус и сообщение
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Внутренняя ошибка сервера';
  res.status(statusCode).json({
    success: false,
    message: message
  });
};

module.exports = errorHandler;