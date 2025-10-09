// Модель заявки - описывает структуру данных заявки на ремонт

const mongoose = require('mongoose');

// server/models/Order.js
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: String, required: true },
  description: String,
  deviceType: String,
  deviceModel: String,
  price: { type: Number, default: 0 },
  
  // ✅ Статус и прогресс
  status: { 
    type: String, 
    enum: ['pending', 'manager_review', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  progress: { type: Number, default: 1, min: 1, max: 5 },
  
  // ✅ Кто работает с заявкой
  assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedMaster: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // ✅ Логи изменений
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);