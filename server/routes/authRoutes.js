const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.post('/change-password', protect, authController.changePassword);
router.get('/verify', protect, authController.verifyToken);
router.get('/me', protect, authController.getCurrentAdmin);

module.exports = router;
