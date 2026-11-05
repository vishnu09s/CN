const mongoose = require('mongoose');

const dispatchSchema = new mongoose.Schema({
  dispatchId: {
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
  dispatchDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  trackingNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  carrier: {
    type: String,
    enum: ['Self', 'Courier', 'Postal', 'Custom'],
    default: 'Self',
  },
  carrierName: {
    type: String,
  },
  estimatedDeliveryDate: {
    type: Date,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: Number,
      unit: String,
      productId: String,
      productName: String,
    },
  ],
  deliveryAddress: {
    type: String,
    required: true,
  },
  deliveryCity: String,
  deliveryState: String,
  deliveryZipCode: String,
  totalAmount: Number,
  status: {
    type: String,
    enum: [
      'Dispatched',
      'In Transit',
      'Out for Delivery',
      'Delivered',
      'Failed Delivery',
      'Returned',
    ],
    default: 'Dispatched',
  },
  deliveryDate: {
    type: Date,
  },
  deliveryConfirmedBy: {
    type: String,
  },
  recipientName: {
    type: String,
  },
  recipientPhone: {
    type: String,
  },
  signature: {
    type: String,
  },
  deliveryProof: {
    type: String,
  },
  deliveryNotes: {
    type: String,
  },
  failureReason: {
    type: String,
  },
  returnTrackingNumber: {
    type: String,
  },
  returnDate: {
    type: Date,
  },
  returnNotes: {
    type: String,
  },
  latitude: Number,
  longitude: Number,
  updates: [
    {
      status: String,
      location: String,
      timestamp: { type: Date, default: Date.now },
      notes: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

dispatchSchema.index({ order: 1 });
dispatchSchema.index({ trackingNumber: 1 });
dispatchSchema.index({ dispatchDate: -1 });
dispatchSchema.index({ status: 1 });
dispatchSchema.index({ customer: 1 });

module.exports = mongoose.model('Dispatch', dispatchSchema);
