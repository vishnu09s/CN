const express = require('express');
const customerLedgerController = require('../controllers/customerLedgerController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/customer/:customerId/summary', authenticate, customerLedgerController.getLedgerSummary);
router.get('/customer/:customerId', authenticate, customerLedgerController.getLedgerByCustomer);
router.get('/', authenticate, customerLedgerController.getAllCustomerLedgers);
router.post('/customer/:customerId', authenticate, customerLedgerController.addLedgerEntry);

module.exports = router;
