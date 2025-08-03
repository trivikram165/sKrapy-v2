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
    enum: ['pending', 'accepted', 'in_progress', 'payment_pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  rejectedVendors: [{
    vendorId: {
      type: String,
      required: true
    },
    rejectedAt: {
      type: Date,
      required: true
    }
  }],
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

// Method to check if vendor can accept order (cooldown check)
orderSchema.methods.canVendorAccept = function(vendorId) {
  const rejection = this.rejectedVendors.find(r => r.vendorId === vendorId);
  if (!rejection) return { canAccept: true, remainingTime: 0 };
  
  const cooldownTime = 10 * 60 * 1000; // 10 minutes in milliseconds
  const timeSinceRejection = Date.now() - rejection.rejectedAt.getTime();
  
  if (timeSinceRejection >= cooldownTime) {
    return { canAccept: true, remainingTime: 0 };
  }
  
  const remainingTimeSeconds = Math.ceil((cooldownTime - timeSinceRejection) / 1000); // in seconds
  return { canAccept: false, remainingTime: remainingTimeSeconds };
};

// Method to add vendor to rejected list
orderSchema.methods.rejectByVendor = function(vendorId) {
  // Remove existing rejection if any (to update timestamp)
  this.rejectedVendors = this.rejectedVendors.filter(r => r.vendorId !== vendorId);
  
  // Add new rejection
  this.rejectedVendors.push({
    vendorId: vendorId,
    rejectedAt: new Date()
  });
  
  // Reset vendor assignment and status
  this.vendorId = null;
  this.status = 'pending';
  this.acceptedAt = null;
};

// Index for efficient queries
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ vendorId: 1, status: 1 });
orderSchema.index({ 'userAddress.pincode': 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);