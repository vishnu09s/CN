const express = require('express');
const router = express.Router();
const dispatchController = require('../controllers/dispatchController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/', dispatchController.getAllDispatches);
router.post('/', dispatchController.createDispatch);
router.get('/:id', dispatchController.getDispatchById);
router.get('/tracking/:trackingNumber', dispatchController.getDispatchByTrackingNumber);
router.put('/:id/status', dispatchController.updateDispatchStatus);
router.post('/:id/confirm-delivery', dispatchController.confirmDelivery);
router.post('/:id/failed-delivery', dispatchController.markFailedDelivery);
router.get('/customer/:customerId', dispatchController.getCustomerDispatches);

module.exports = router;
