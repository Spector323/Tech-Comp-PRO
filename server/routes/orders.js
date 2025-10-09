// Роуты для работы с заявками на ремонт

const express = require('express');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const router = express.Router();

// Все роуты защищены авторизацией
router.use(auth);

router.get('/', auth, async (req, res) => {
  try {
    let orders;

    if (req.user.role === 'client') {
      orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    }
    else if (req.user.role === 'manager') {
      orders = await Order.find({
        $or: [
          { status: 'pending' },
          { status: 'manager_review' },
          { assignedManager: req.user.id }
        ]
      }).populate('user', 'firstName lastName email phone').sort({ createdAt: -1 });
    }
    else if (req.user.role === 'master') {
      orders = await Order.find({
        $or: [
          { status: 'accepted' },
          { assignedMaster: req.user.id }
        ]
      }).populate('user', 'firstName lastName email phone').sort({ createdAt: -1 });
    }
    else if (req.user.role === 'admin') {
      orders = await Order.find().populate('user', 'firstName lastName email phone').sort({ createdAt: -1 });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка загрузки заявок', error: error.message });
  }
});

// ✅ Создать заявку (клиент)
router.post('/', auth, async (req, res) => {
  try {
    const { service, description, deviceType, deviceModel } = req.body;

    const order = await Order.create({
      user: req.user.id,
      service,
      description,
      deviceType,
      deviceModel,
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        changedBy: req.user.id
      }]
    });

    res.status(201).json({
      message: 'Заявка создана',
      order: await Order.findById(order._id).populate('user', 'firstName lastName')
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка создания заявки', error: error.message });
  }
});

// ✅ Обновить заявку (клиент - только свои, менеджер/мастер - назначенные)
router.put('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    // Проверка прав
    if (req.user.role === 'client' && order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    ).populate('user', 'firstName lastName');

    res.json({ message: 'Заявка обновлена', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка обновления заявки', error: error.message });
  }
});

// ✅ Удалить заявку (только клиент - свои заявки)
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Заявка удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка удаления заявки', error: error.message });
  }
});

// ✅ Менеджер: принять заявку в работу
router.patch('/:id/accept', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Только менеджер может принимать заявки' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: 'accepted',
        assignedManager: req.user.id,
        $push: {
          statusHistory: {
            status: 'accepted',
            changedBy: req.user.id
          }
        }
      },
      { new: true }
    ).populate('user', 'firstName lastName');

    res.json({ message: 'Заявка принята в работу', order });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка принятия заявки', error: error.message });
  }
});

// ✅ Менеджер: отклонить заявку
router.patch('/:id/reject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Только менеджер может отклонять заявки' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        assignedManager: req.user.id,
        $push: {
          statusHistory: {
            status: 'rejected',
            changedBy: req.user.id
          }
        }
      },
      { new: true }
    ).populate('user', 'firstName lastName');

    res.json({ message: 'Заявка отклонена', order });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка отклонения заявки', error: error.message });
  }
});

// ✅ Мастер: взять заявку в работу
router.patch('/:id/assign-master', auth, async (req, res) => {
  try {
    if (req.user.role !== 'master' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Только мастер может брать заявки' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: 'in_progress',
        assignedMaster: req.user.id,
        $push: {
          statusHistory: {
            status: 'in_progress',
            changedBy: req.user.id
          }
        }
      },
      { new: true }
    ).populate('user', 'firstName lastName');

    res.json({ message: 'Заявка взята в работу', order });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка назначения заявки', error: error.message });
  }
});

// ✅ Мастер: установить цену
router.patch('/:id/set-price', auth, async (req, res) => {
  try {
    const { price } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { price },
      { new: true }
    ).populate('user', 'firstName lastName');

    res.json({ message: 'Цена установлена', order });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка установки цены', error: error.message });
  }
});

module.exports = router;