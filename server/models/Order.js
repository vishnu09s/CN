const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      sellingPrice: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        default: 0,
      },
      subtotal: {
        type: Number,
        required: true,
      },
    },
  ],
  subtotal: {
    type: Number,
    required: true,
    default: 0,
  },
  totalDiscount: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  deliveryAddress: {
    type: String,
    required: true,
  },
  expectedDeliveryDate: {
    type: Date,
  },
  actualDeliveryDate: {
    type: Date,
  },
  orderStatus: {
    type: String,
    enum: [
      'Order Received',
      'Accepted',
      'Processing',
      'Ready for Dispatch',
      'Dispatched',
      'Delivered',
      'Cancelled',
    ],
    default: 'Order Received',
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Fully Paid'],
    default: 'Unpaid',
  },
  totalPaid: {
    type: Number,
    default: 0,
  },
  pendingAmount: {
    type: Number,
  },
  reservedInventory: [
    {
      product: mongoose.Schema.Types.ObjectId,
      quantity: Number,
    },
  ],
  trackingNumber: {
    type: String,
  },
  dispatchDate: {
    type: Date,
  },
  notes: {
    type: String,
  },
  invoiceGenerated: {
    type: Boolean,
    default: false,
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.pre('save', function (next) {
  this.pendingAmount = this.totalAmount - this.totalPaid;
  next();
});

orderSchema.index({ customer: 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderDate: -1 });

module.exports = mongoose.model('Order', orderSchema);
