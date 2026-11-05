const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/', customerController.getAllCustomers);
router.post('/', customerController.createCustomer);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);
router.get('/:id/ledger', customerController.getCustomerLedger);

module.exports = router;
