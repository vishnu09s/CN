const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  unit: {
    type: String,
    required: [true, 'Please provide unit of measurement'],
    enum: ['piece', 'kg', 'liter', 'meter', 'box', 'pack', 'dozen', 'bundle', 'other'],
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Please provide purchase price'],
    min: 0,
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Please provide selling price'],
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  reservedQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  minimumThreshold: {
    type: Number,
    required: true,
    default: 10,
    min: 0,
  },
  isLowStock: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
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

// Index for frequently queried fields
productSchema.index({ category: 1 });
productSchema.index({ productId: 1 });

module.exports = mongoose.model('Product', productSchema);
