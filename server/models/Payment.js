const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    unique: true,
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please provide payment amount'],
    min: 0,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'],
    required: true,
  },
  transactionReference: {
    type: String,
  },
  chequeNumber: {
    type: String,
  },
  chequeDate: {
    type: Date,
  },
  bankName: {
    type: String,
  },
  upiId: {
    type: String,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Confirmed',
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

paymentSchema.index({ customer: 1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
