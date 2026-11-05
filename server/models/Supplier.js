const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide supplier name'],
    trim: true,
  },
  contactPerson: {
    type: String,
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
  gstNumber: {
    type: String,
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
  },
  paymentTerms: {
    type: String,
    default: 'Net 30',
  },
  totalPurchases: {
    type: Number,
    default: 0,
  },
  totalAmountPaid: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
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

module.exports = mongoose.model('Supplier', supplierSchema);
