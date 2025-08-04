const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: ['user', 'vendor'],
    required: true
  },
  phoneNumber: {
    type: String
  },
  address: {
    fullAddress: {
      type: String,
      required: function() { return this.profileCompleted; }
    },
    city: {
      type: String,
      required: function() { return this.profileCompleted; }
    },
    state: {
      type: String,
      required: function() { return this.profileCompleted; }
    },
    pincode: {
      type: String,
      required: function() { return this.profileCompleted; }
    }
  },
  // Vendor-specific fields
  businessName: {
    type: String,
    required: function() { return this.role === 'vendor' && this.profileCompleted; }
  },
  gstin: {
    type: String,
    required: false, // GSTIN is optional for vendors
    validate: {
      validator: function(v) {
        // Only validate GSTIN format if it's provided and user is a vendor
        if (this.role === 'vendor' && v && v.trim()) {
          return /^[0-9A-Z]{15}$/.test(v);
        }
        return true;
      },
      message: 'GSTIN must be exactly 15 characters (letters and numbers only)'
    }
  },
  walletAddress: {
    type: String,
    default: null
  },
  walletReminderDismissed: {
    type: Boolean,
    default: false
  },
  profileCompleted: {
    type: Boolean,
    default: false
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

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index to allow same person to have both user and vendor profiles
userSchema.index({ clerkId: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
