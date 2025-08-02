const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  userId: {
    type: String,
    required: true // Clerk user ID
  },
  vendorId: {
    type: String,
    default: null // Clerk vendor ID who accepted the order
  },
  userAddress: {
    fullAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  items: [{
    id: { type: Number, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'kg' },
    total: { type: Number, required: true }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ vendorId: 1, status: 1 });
orderSchema.index({ 'userAddress.pincode': 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);