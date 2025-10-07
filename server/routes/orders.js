// Роуты для работы с заявками на ремонт

const express = require('express');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const router = express.Router();

// Все роуты защищены авторизацией
router.use(auth);

// Получить все заявки текущего пользователя
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 }); // Сначала новые

    res.json(orders);
  } catch (error) {
    res.status(500).json({ 
      message: 'Ошибка загрузки заявок',
      error: error.message 
    });
  }
});

// Создать новую заявку
router.post('/', async (req, res) => {
  try {
    const { service, description, deviceType, deviceModel, price } = req.body;

    const order = await Order.create({
      user: req.user.id,
      service,
      description,
      deviceType,
      deviceModel,
      price
    });

    res.status(201).json({
      success: true,
      message: 'Заявка создана',
      order
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Ошибка создания заявки',
      error: error.message 
    });
  }
});

// Получить одну заявку
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!order) {
      return res.status(404).json({ 
        message: 'Заявка не найдена' 
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ 
      message: 'Ошибка загрузки заявки',
      error: error.message 
    });
  }
});

module.exports = router;