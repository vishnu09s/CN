const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/', productController.getAllProducts);
router.get('/low-stock', productController.getLowStockProducts);
router.post('/', productController.createProduct);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.get('/:id/transactions', productController.getProductTransactions);
router.post('/:id/adjust-inventory', productController.adjustInventory);

module.exports = router;
