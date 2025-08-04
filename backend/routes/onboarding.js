const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Complete user profile after signup
router.post('/complete-profile', async (req, res) => {
  try {
    const { clerkId, role, fullAddress, city, state, pincode, businessName, gstin } = req.body;

    // Validate required fields
    if (!clerkId || !role || !fullAddress || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: clerkId, role, fullAddress, city, state, pincode'
      });
    }

    // Validate vendor-specific fields
    if (role === 'vendor') {
      if (!businessName) {
        return res.status(400).json({
          success: false,
          message: 'Business name is required for vendors'
        });
      }

      // Validate GSTIN format only if provided (15 characters, alphanumeric)
      if (gstin && gstin.trim() && !/^[0-9A-Z]{15}$/.test(gstin)) {
        return res.status(400).json({
          success: false,
          message: 'GSTIN must be exactly 15 characters (letters and numbers only)'
        });
      }
    }

    // Validate pincode format (6 digits)
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Pincode must be exactly 6 digits'
      });
    }

    // Prepare update object
    const updateData = {
      address: {
        fullAddress,
        city,
        state,
        pincode
      },
      profileCompleted: true
    };

    // Add vendor-specific fields if role is vendor
    if (role === 'vendor') {
      updateData.businessName = businessName;
      if (gstin && gstin.trim()) {
        updateData.gstin = gstin.toUpperCase(); // Ensure GSTIN is uppercase
      }
    }

    // Find and update user for specific role
    const user = await User.findOneAndUpdate(
      { clerkId, role },
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile completed successfully',
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        address: user.address,
        profileCompleted: user.profileCompleted
      }
    });

  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
});

// Check if user profile is completed for specific role
router.get('/check-profile/:clerkId/:role', async (req, res) => {
  try {
    const { clerkId, role } = req.params;

    const user = await User.findOne({ clerkId, role });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found for this role'
      });
    }

    // For vendors, ensure all required fields including business info are present
    let isProfileComplete = user.profileCompleted;
    
    if (role === 'vendor' && user.profileCompleted) {
      // Double-check vendor-specific fields (only businessName is required, GSTIN is optional)
      const hasRequiredVendorFields = user.businessName && 
                                     user.businessName.trim() !== '';
      
      // Validate GSTIN format if it's provided
      const hasValidGstin = !user.gstin || 
                           (user.gstin.trim() !== '' && /^[0-9A-Z]{15}$/.test(user.gstin));
      
      if (!hasRequiredVendorFields || !hasValidGstin) {
        isProfileComplete = false;
        console.log('Vendor profile incomplete: missing business name or invalid GSTIN format');
      }
    }

    // Prepare response data
    const responseData = {
      id: user._id,
      clerkId: user.clerkId,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      address: user.address,
      profileCompleted: isProfileComplete
    };

    // Include vendor-specific fields for vendors
    if (role === 'vendor') {
      responseData.businessName = user.businessName;
      responseData.gstin = user.gstin;
    }

    res.status(200).json({
      success: true,
      profileCompleted: isProfileComplete,
      user: responseData
    });

  } catch (error) {
    console.error('Check profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
});

module.exports = router;
