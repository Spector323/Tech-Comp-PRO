// Модель пользователя - описывает структуру данных пользователя в базе

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Имя обязательно'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Фамилия обязательна'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email обязателен'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Пароль обязателен'],
    minlength: 6,
    select: false
  },
  avatar: {
    type: String,
    default: '/assets/avatar.png'
  },
  role: {
    type: String,
    enum: ['client', 'master', 'manager', 'admin'],
    default: 'client'
  },
  specialization: {
    type: String, // Для мастеров: "Ноутбуки", "Телефоны", "Компьютеры"
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});
console.log('✅ Модель User загружена!');
// Шифруем пароль перед сохранением
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Метод для проверки пароля
userSchema.methods.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);