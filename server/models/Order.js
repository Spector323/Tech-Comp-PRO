const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: String,
    required: true
  },
  description: String,
  deviceType: String,
  deviceModel: String,
  price: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'manager_review', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  progress: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  assignedManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedMaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  statusHistory: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);