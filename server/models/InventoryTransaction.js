const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  transactionType: {
    type: String,
    enum: [
      'Purchase Addition',
      'Stock Adjustment',
      'Order Reservation',
      'Order Dispatch',
      'Order Cancellation',
      'Stock Damage',
      'Stock Return',
      'Manual Adjustment',
    ],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  previousQuantity: {
    type: Number,
    required: true,
  },
  newQuantity: {
    type: Number,
    required: true,
  },
  reference: {
    referenceType: {
      type: String,
      enum: ['Order', 'Purchase', 'Manual'],
      required: true,
    },
    referenceId: mongoose.Schema.Types.ObjectId,
    referenceNumber: String,
  },
  notes: {
    type: String,
  },
  createdBy: {
    type: String,
    default: 'System',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

inventoryTransactionSchema.index({ product: 1 });
inventoryTransactionSchema.index({ transactionType: 1 });
inventoryTransactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
