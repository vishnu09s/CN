const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard-stats', authenticate, reportController.getDashboardStats);
router.get('/sales', authenticate, reportController.getSalesReport);
router.get('/inventory', authenticate, reportController.getInventoryReport);
router.get('/customers', authenticate, reportController.getCustomerReport);
router.get('/orders', authenticate, reportController.getOrderReport);
router.get('/payments', authenticate, reportController.getPaymentReport);
router.get('/profit-loss', authenticate, reportController.getProfitLossReport);

module.exports = router;
