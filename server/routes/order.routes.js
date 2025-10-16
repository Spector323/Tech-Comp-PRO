const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  acceptOrder,
  rejectOrder,
  assignMaster,
  setPrice
} = require('../controllers/order.controller');

router.use(auth);

router.get('/', getAllOrders);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);
router.patch('/:id/accept', acceptOrder);
router.patch('/:id/reject', rejectOrder);
router.patch('/:id/assign-master', assignMaster);
router.patch('/:id/set-price', setPrice);

module.exports = router;