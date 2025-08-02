const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET /api/users
// @desc    Get all users
// @access  Public (you can add authentication later)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   POST /api/users
// @desc    Create a user
// @access  Public
router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message
    });
  }
});

// @route   POST /api/users/clerk-signup
// @desc    Create user after Clerk signup (without address requirements)
// @access  Public
router.post('/clerk-signup', async (req, res) => {
  try {
    const { clerkId, username, email, firstName, lastName, role } = req.body;

    // Check if user already exists for this specific role
    const existingUser = await User.findOne({ clerkId, role });
    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: 'User already exists for this role',
        data: existingUser
      });
    }

    // Create user with profileCompleted: false for this specific role
    const user = await User.create({
      clerkId,
      username,
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      role,
      profileCompleted: false
    });
    
    res.status(201).json({
      success: true,
      message: 'User profile created successfully for role: ' + role,
      data: user
    });
  } catch (error) {
    console.error('Clerk signup error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create user profile',
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

module.exports = router;
