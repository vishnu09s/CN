const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide customer name'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
  },
  email: {
    type: String,
  },
  address: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  zipCode: {
    type: String,
  },
  businessName: {
    type: String,
    trim: true,
  },
  gstNumber: {
    type: String,
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  totalPurchased: {
    type: Number,
    default: 0,
  },
  totalPaid: {
    type: Number,
    default: 0,
  },
  outstandingBalance: {
    type: Number,
    default: 0,
  },
  creditLimit: {
    type: Number,
    default: 0,
  },
  paymentTerms: {
    type: String,
    default: 'Cash on Delivery',
  },
  notes: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  lastOrderDate: {
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

customerSchema.index({ customerId: 1 });
customerSchema.index({ phone: 1 });

module.exports = mongoose.model('Customer', customerSchema);
