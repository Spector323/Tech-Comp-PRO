const express = require('express');
const User = require('../models/User');
const { restrictTo } = require('../middleware/root');

const router = express.Router();

// Получение userId по email
router.get('/email/:email', restrictTo('manager', 'admin'), async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json({ _id: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка поиска пользователя' });
  }
});

// Получение пользователей по роли
router.get('/', restrictTo('manager', 'admin'), async (req, res) => {
  try {
    const { role, email } = req.query;
    const query = {};
    if (role) query.role = role;
    if (email) query.email = { $regex: email, $options: 'i' };
    const users = await User.find(query);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка поиска пользователей' });
  }
});

module.exports = router;