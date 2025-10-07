// Модель заявки - описывает структуру данных заявки на ремонт

const mongoose = require('mongoose');

// server/models/Order.js
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: String, required: true },        // Услуга: "Ремонт MacBook"
  description: String,                              // Описание: "Не включается"
  deviceType: String,                               // Тип: "Ноутбук"
  deviceModel: String,                              // Модель: "MacBook Pro 16"
  status: {
    type: String,
    default: 'pending',                             // pending, in_progress, completed, cancelled
  },
  progress: { type: Number, default: 1 },          // 1-5 (этапы ремонта)
  price: { type: Number, default: 0 }              // Стоимость
}, {
  timestamps: true                                  // createdAt, updatedAt
});

module.exports = mongoose.model('Order', orderSchema);