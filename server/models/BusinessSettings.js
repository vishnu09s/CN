const mongoose = require('mongoose');

const businessSettingsSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: [true, 'Please provide business name'],
  },
  ownerName: {
    type: String,
  },
  businessLogo: {
    type: String,
  },
  businessEmail: {
    type: String,
  },
  businessPhone: {
    type: String,
  },
  businessAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  gstNumber: {
    type: String,
  },
  panNumber: {
    type: String,
  },
  bankDetails: {
    bankName: String,
    accountName: String,
    accountNumber: String,
    ifscCode: String,
    upi: String,
  },
  invoiceSettings: {
    invoicePrefix: {
      type: String,
      default: 'INV',
    },
    invoiceStartNumber: {
      type: Number,
      default: 1001,
    },
    currentInvoiceNumber: {
      type: Number,
      default: 1001,
    },
    invoiceFormat: {
      type: String,
      enum: ['Format1', 'Format2', 'Format3'],
      default: 'Format1',
    },
    termsAndConditions: String,
  },
  taxSettings: {
    currency: {
      type: String,
      default: 'INR',
    },
    taxPercentage: {
      type: Number,
      default: 18,
    },
    includeTaxInPrice: {
      type: Boolean,
      default: false,
    },
  },
  inventorySettings: {
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    enableLowStockAlerts: {
      type: Boolean,
      default: true,
    },
  },
  paymentMethods: {
    enableCash: { type: Boolean, default: true },
    enableUPI: { type: Boolean, default: true },
    enableBankTransfer: { type: Boolean, default: true },
    enableCheque: { type: Boolean, default: true },
  },
  workingHours: {
    mondayToFriday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
    },
    saturday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '13:00' },
    },
    sundayOpen: { type: Boolean, default: false },
  },
  timeZone: {
    type: String,
    default: 'Asia/Kolkata',
  },
  dateFormat: {
    type: String,
    default: 'DD/MM/YYYY',
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

module.exports = mongoose.model('BusinessSettings', businessSettingsSchema);
