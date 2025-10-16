const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../utils/fileUtile');
const {
  uploadAvatar,
  getProfile,
  updateProfile,
  getAllUsers,
  createUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser
} = require('../controllers/user.controller');

// Защищённые роуты (авторизация обязательна)
router.use(auth);

// Профиль текущего пользователя
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

// Админские роуты
router.get('/admin/users', getAllUsers);
router.post('/admin/users', createUser);
router.patch('/admin/users/:id/role', updateUserRole);
router.patch('/admin/users/:id/status', toggleUserStatus);
router.delete('/admin/users/:id', deleteUser);

module.exports = router;