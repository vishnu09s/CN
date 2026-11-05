const mongoose = require('mongoose');

const CustomerLedgerSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    transactionType: {
      type: String,
      enum: ['Order', 'Payment', 'Credit', 'Debit'],
      required: true,
    },
    description: String,
    debit: {
      type: Number,
      default: 0,
      min: 0,
    },
    credit: {
      type: Number,
      default: 0,
      min: 0,
    },
    runningBalance: {
      type: Number,
      default: 0,
    },
    reference: {
      type: String,
      type: String,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    notes: String,
    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

CustomerLedgerSchema.index({ customer: 1, transactionDate: -1 });

module.exports = mongoose.model('CustomerLedger', CustomerLedgerSchema);
