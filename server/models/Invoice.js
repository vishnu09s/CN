const mongoose = require('mongoose');

const InvoiceItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  productName: String,
  productId: String,
  quantity: Number,
  unit: String,
  rate: Number,
  tax: Number,
  amount: Number,
});

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      required: true,
      unique: true,
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
    dueDate: Date,
    items: [InvoiceItemSchema],
    subtotal: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ['Fixed', 'Percentage'],
      default: 'Fixed',
    },
    shippingCharges: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    notes: String,
    terms: String,
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Viewed', 'Paid', 'Overdue', 'Cancelled'],
      default: 'Draft',
    },
    invoiceNumber: String,
    paymentTerms: String,
    businessName: String,
    businessAddress: String,
    businessPhone: String,
    businessEmail: String,
    businessGST: String,
    customerName: String,
    customerAddress: String,
    customerPhone: String,
    customerEmail: String,
    customerGST: String,
    pdfUrl: String,
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    sentDate: Date,
    viewedDate: Date,
    paidDate: Date,
  },
  { timestamps: true }
);

InvoiceSchema.index({ invoiceId: 1 });
InvoiceSchema.index({ order: 1 });
InvoiceSchema.index({ customer: 1 });
InvoiceSchema.index({ invoiceDate: -1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);
