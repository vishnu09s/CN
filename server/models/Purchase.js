const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  purchaseId: {
    type: String,
    unique: true,
    required: true,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  },
  purchaseDate: {
    type: Date,
    required: true,
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
      purchasePrice: {
        type: Number,
        required: true,
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
  additionalExpenses: {
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
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Fully Paid'],
    default: 'Unpaid',
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  pendingAmount: {
    type: Number,
  },
  referenceNumber: {
    type: String,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Received', 'Cancelled'],
    default: 'Pending',
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

purchaseSchema.pre('save', function (next) {
  this.pendingAmount = this.totalAmount - this.amountPaid;
  next();
});

purchaseSchema.index({ supplier: 1 });
purchaseSchema.index({ purchaseDate: -1 });
purchaseSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
