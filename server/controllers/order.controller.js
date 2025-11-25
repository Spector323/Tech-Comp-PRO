const Order = require('../models/Order');
const User = require('../models/User');

const getAllOrders = async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'client') {
      orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    } else if (req.user.role === 'manager') {
      orders = await Order.find({
        $or: [
          { status: 'pending' },
          { status: 'manager_review' },
          { assignedManager: req.user.id }
        ]
      }).populate('user', 'firstName lastName email phone').sort({ createdAt: -1 });
    } else if (req.user.role === 'master') {
      orders = await Order.find({
        $or: [
          { status: 'accepted' },
          { assignedMaster: req.user.id }
        ]
      }).populate('user', 'firstName lastName email phone').sort({ createdAt: -1 });
    } else if (req.user.role === 'admin') {
      orders = await Order.find().populate('user', 'firstName lastName email phone').sort({ createdAt: -1 });
    }
    res.json(orders);
  } catch (error) {
    console.error('Ошибка загрузки заявок:', error);
    res.status(500).json({ message: 'Ошибка загрузки заявок' });
  }
};
const getOrdersByRole = async (req, res) => {
  try {
    let orders;

    switch (req.user.role) {
      case 'client':
        orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        break;

      case 'manager':
        orders = await Order.find({
          $or: [
            { status: 'pending' },
            { status: 'manager_review' },
            { assignedManager: req.user.id }
          ]
        })
          .populate('user', 'firstName lastName email phone')
          .sort({ createdAt: -1 });
        break;

      case 'master':
        orders = await Order.find({
          $or: [
            { status: 'accepted' },
            { assignedMaster: req.user.id }
          ]
        })
          .populate('user', 'firstName lastName email phone')
          .sort({ createdAt: -1 });
        break;

      case 'admin':
        orders = await Order.find()
          .populate('user', 'firstName lastName email phone')
          .sort({ createdAt: -1 });
        break;

      default:
        return res.status(403).json({ message: 'Нет доступа к заявкам' });
    }

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Ошибка загрузки заявок:', error);
    res.status(500).json({ message: 'Ошибка загрузки заявок' });
  }
};
const createOrder = async (req, res) => {
  try {
    if (!req.user.emailVerified) {
      // Проверяем подтвержден ли email
      return res.status(403).json({
        success: false,
        message: 'Для создания заявок необходимо подтвердить email'
      })
    } // ✅ ДОБАВИТЬ ЭТУ СКОБКУ!

    const { service, description, deviceType, deviceModel } = req.body;
    const order = await Order.create({
      user: req.user.id,
      service,
      description,
      deviceType,
      deviceModel,
      status: 'pending',
      statusHistory: [{ status: 'pending', changedBy: req.user.id }]
    });

    const populatedOrder = await Order.findById(order._id).populate('user', 'firstName lastName');
    res.status(201).json({ message: 'Заявка создана', order: populatedOrder });
  } catch (error) {
    console.error('Ошибка создания заявки:', error);
    res.status(500).json({ message: 'Ошибка создания заявки' });
  }
};
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Заявка не найдена' });

    if (req.user.role === 'client' && order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Нет доступа' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName');

    res.json({ message: 'Заявка обновлена', order: updatedOrder });
  } catch (error) {
    console.error('Ошибка обновления заявки:', error);
    res.status(500).json({ message: 'Ошибка обновления заявки' });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Заявка не найдена' });
    if (order.user.toString() !== req.user.id) return res.status(403).json({ message: 'Нет доступа' });

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Заявка удалена' });
  } catch (error) {
    console.error('Ошибка удаления заявки:', error);
    res.status(500).json({ message: 'Ошибка удаления заявки' });
  }
};

const acceptOrder = async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Только менеджер может принимать заявки' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: 'accepted',
        assignedManager: req.user.id,
        $push: { statusHistory: { status: 'accepted', changedBy: req.user.id } }
      },
      { new: true }
    ).populate('user', 'firstName lastName');
    res.json({ message: 'Заявка принята в работу', order });
  } catch (error) {
    console.error('Ошибка принятия заявки:', error);
    res.status(500).json({ message: 'Ошибка принятия заявки' });
  }
};

const rejectOrder = async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Только менеджер может отклонять заявки' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        assignedManager: req.user.id,
        $push: { statusHistory: { status: 'rejected', changedBy: req.user.id } }
      },
      { new: true }
    ).populate('user', 'firstName lastName');
    res.json({ message: 'Заявка отклонена', order });
  } catch (error) {
    console.error('Ошибка отклонения заявки:', error);
    res.status(500).json({ message: 'Ошибка отклонения заявки' });
  }
};

const assignMaster = async (req, res) => {
  try {
    if (req.user.role !== 'master' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Только мастер может брать заявки' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: 'in_progress',
        assignedMaster: req.user.id,
        $push: { statusHistory: { status: 'in_progress', changedBy: req.user.id } }
      },
      { new: true }
    ).populate('user', 'firstName lastName');
    res.json({ message: 'Заявка взята в работу', order });
  } catch (error) {
    console.error('Ошибка назначения заявки:', error);
    res.status(500).json({ message: 'Ошибка назначения заявки' });
  }
};

const setPrice = async (req, res) => {
  try {
    const { price } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { price },
      { new: true }
    ).populate('user', 'firstName lastName');
    res.json({ message: 'Цена установлена', order });
  } catch (error) {
    console.error('Ошибка установки цены:', error);
    res.status(500).json({ message: 'Ошибка установки цены' });
  }
};

module.exports = {
  getOrdersByRole,
  getAllOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  acceptOrder,
  rejectOrder,
  assignMaster,
  setPrice
};