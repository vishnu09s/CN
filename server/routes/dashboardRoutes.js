const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All dashboard routes are protected
router.use(protect);

// Get all dashboard data at once
router.get('/all', dashboardController.getAllDashboardData);

// Individual endpoints
router.get('/overview', dashboardController.getOverview);
router.get('/orders', dashboardController.getOrderStats);
router.get('/recent-orders', dashboardController.getRecentOrders);
router.get('/recent-transactions', dashboardController.getRecentTransactions);
router.get('/low-stock', dashboardController.getLowStockProducts);
router.get('/outstanding-customers', dashboardController.getOutstandingCustomers);
router.get('/monthly-sales', dashboardController.getMonthlySales);
router.get('/monthly-purchases', dashboardController.getMonthlyPurchases);
router.get('/top-products', dashboardController.getTopProducts);

module.exports = router;
