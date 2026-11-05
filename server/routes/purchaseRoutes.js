const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/', purchaseController.getAllPurchases);
router.post('/', purchaseController.createPurchase);
router.get('/:id', purchaseController.getPurchaseById);
router.post('/:id/confirm', purchaseController.confirmPurchase);
router.post('/:id/payment', purchaseController.recordPayment);
router.post('/:id/cancel', purchaseController.cancelPurchase);
router.get('/supplier/:supplierId', purchaseController.getSupplierPurchases);

module.exports = router;
