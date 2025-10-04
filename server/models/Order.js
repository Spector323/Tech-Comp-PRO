const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: String, required: true },
  category: { type: String, enum: ['phone_repair', 'laptop_repair', 'software_install', 'other'], default: 'other' },
  status: { type: String, default: 'pending', enum: ['pending', 'in_progress', 'completed', 'blocked'] },
  progress: { type: Number, default: 1, min: 1, max: 5 },
  updates: [{ description: String, createdAt: Date }],
  assignedMaster: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);