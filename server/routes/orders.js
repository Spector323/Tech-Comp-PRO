const express = require('express');
const { restrictTo } = require('../middleware/root');
const Order = require('../models/Order');

const router = express.Router();

// Создание заявки (для менеджеров)
router.post('/', restrictTo('manager'), async (req, res) => {
  const { userId, service } = req.body;

  if (!userId || !service) {
    return res.status(400).json({ message: 'ID пользователя и описание услуги обязательны' });
  }

  try {
    const order = new Order({ userId, service });
    await order.save();
    res.status(201).json({ message: 'Заявка создана', order });
  } catch (error) {
    console.error('Ошибка создания заявки:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение заявок клиента
router.get('/user/:userId', restrictTo('client', 'admin', 'manager'), async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).populate('userId', 'firstName lastName email');
    res.json(orders);
  } catch (error) {
    console.error('Ошибка получения заявок:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавление обновления к заявке (для мастеров)
router.post('/:orderId/update', restrictTo('master'), async (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ message: 'Описание обновления обязательно' });
  }

  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    order.updates.push({
      description,
      createdBy: req.userId
    });

    // Пример: обновляем прогресс в зависимости от описания
    if (description.includes('диагностика')) {
      order.progress = 2;
    } else if (description.includes('ремонт')) {
      order.progress = 3;
    } else if (description.includes('тест')) {
      order.progress = 4;
    } else if (description.includes('выдача')) {
      order.progress = 5;
      order.status = 'completed';
    }

    await order.save();
    res.json({ message: 'Обновление добавлено', order });
  } catch (error) {
    console.error('Ошибка добавления обновления:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение всех заявок (для админов)
router.get('/', restrictTo('admin'), async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'firstName lastName email');
    res.json(orders);
  } catch (error) {
    console.error('Ошибка получения всех заявок:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;