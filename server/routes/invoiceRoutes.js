const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticate, invoiceController.getInvoiceStats);
router.get('/number/:invoiceId', invoiceController.getInvoiceByNumber);
router.get('/customer/:customerId', authenticate, invoiceController.getCustomerInvoices);
router.get('/:id', authenticate, invoiceController.getInvoiceById);
router.get('/', authenticate, invoiceController.getAllInvoices);
router.post('/', authenticate, invoiceController.createInvoice);
router.put('/:id', authenticate, invoiceController.updateInvoice);
router.post('/:id/send', authenticate, invoiceController.sendInvoice);
router.post('/:id/mark-paid', authenticate, invoiceController.markAsPaid);
router.post('/:id/cancel', authenticate, invoiceController.cancelInvoice);

module.exports = router;
