const express = require('express');
const Order = require('../models/Order');
const { restrictTo } = require('../middleware/root');

const router = express.Router();

// Создание заявки (для клиентов и менеджеров)
router.post('/', restrictTo('client', 'manager'), async (req, res) => {
  const { service, category, userId } = req.body;
  if (!service) {
    return res.status(400).json({ message: 'Описание услуги обязательно' });
  }
  try {
    const order = new Order({
      userId: userId || req.userId, // Менеджер может указать userId клиента
      service,
      category: category || 'other',
      status: 'pending',
      progress: 1,
      updates: [],
      assignedMaster: null
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка создания заявки' });
  }
});

// Получение заявок пользователя
router.get('/user/:userId', restrictTo('client', 'admin', 'manager', 'master'), async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).populate('userId', 'firstName lastName');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения заявок' });
  }
});

// Получение всех заявок (для админа/менеджера)
router.get('/', restrictTo('admin', 'manager', 'master'), async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'firstName lastName');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения заявок' });
  }
});

// Получение заявок, назначенных мастеру
router.get('/master/:masterId', restrictTo('master'), async (req, res) => {
  try {
    const orders = await Order.find({ assignedMaster: req.params.masterId }).populate('userId', 'firstName lastName');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения заявок мастера' });
  }
});

// Добавление обновления к заявке
router.post('/:orderId/update', restrictTo('master', 'manager'), async (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ message: 'Описание обновления обязательно' });
  }
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Заявка не найдена' });
    order.updates.push({ description, createdAt: new Date() });
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка добавления обновления' });
  }
});

// Обновление статуса и прогресса заявки
router.patch('/:orderId', restrictTo('master', 'manager'), async (req, res) => {
  const { status, progress } = req.body;
  if (!status && !progress) {
    return res.status(400).json({ message: 'Укажите статус или прогресс' });
  }
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Заявка не найдена' });
    if (status) order.status = status;
    if (progress) order.progress = progress;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка обновления заявки' });
  }
});

// Назначение мастера на заявку
router.patch('/assign/:orderId', restrictTo('admin', 'manager'), async (req, res) => {
  const { masterId } = req.body;
  if (!masterId) {
    return res.status(400).json({ message: 'Укажите ID мастера' });
  }
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Заявка не найдена' });
    order.assignedMaster = masterId;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка назначения мастера' });
  }
});

module.exports = router;