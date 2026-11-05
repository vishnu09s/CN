const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticate, paymentController.getPaymentStats);
router.get('/customer/:customerId', authenticate, paymentController.getCustomerPayments);
router.get('/:id', authenticate, paymentController.getPaymentById);
router.get('/', authenticate, paymentController.getAllPayments);
router.post('/', authenticate, paymentController.createPayment);
router.put('/:id', authenticate, paymentController.updatePaymentStatus);

module.exports = router;
