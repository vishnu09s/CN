const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true,
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      description: String,
      quantity: Number,
      unitPrice: Number,
      discount: Number,
      subtotal: Number,
    },
  ],
  subtotal: {
    type: Number,
    required: true,
  },
  totalDiscount: {
    type: Number,
    default: 0,
  },
  taxableAmount: {
    type: Number,
  },
  tax: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  amountReceived: {
    type: Number,
    default: 0,
  },
  pendingBalance: {
    type: Number,
  },
  invoiceType: {
    type: String,
    enum: ['Invoice', 'Receipt', 'Proforma Invoice'],
    default: 'Invoice',
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Fully Paid', 'Cancelled'],
    default: 'Unpaid',
  },
  notes: {
    type: String,
  },
  termsAndConditions: {
    type: String,
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    upi: String,
  },
  signatureRequired: {
    type: Boolean,
    default: true,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  lastDownloadedAt: {
    type: Date,
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

invoiceSchema.pre('save', function (next) {
  this.pendingBalance = this.totalAmount - this.amountReceived;
  next();
});

invoiceSchema.index({ order: 1 });
invoiceSchema.index({ customer: 1 });
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ invoiceDate: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
