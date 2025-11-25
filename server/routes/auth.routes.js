const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  verifyEmail, 
  resendVerification 
} = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
// Роут для подтверждения email
router.post('/resend-verification', resendVerification);
// Роут для повторной отправки письма

module.exports = router;