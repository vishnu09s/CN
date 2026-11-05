const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/', orderController.getAllOrders);
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrderById);
router.post('/:id/accept', orderController.acceptOrder);
router.put('/:id/status', orderController.updateOrderStatus);
router.post('/:id/payment', orderController.recordPayment);
router.get('/customer/:customerId', orderController.getCustomerOrders);

module.exports = router;
