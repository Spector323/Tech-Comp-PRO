const express = require('express');
const { restrictTo } = require('../middleware/root');

const router = express.Router();

// Добавить категорию
router.post('/', restrictTo('admin'), async (req, res) => {
  const { category } = req.body;
  if (!category) return res.status(400).json({ message: 'Укажите категорию' });
  res.status(201).json({ message: 'Категория добавлена', category });
});

// Удалить категорию
router.delete('/:category', restrictTo('admin'), async (req, res) => {
  res.json({ message: 'Категория удалена', category: req.params.category });
});

module.exports = router;