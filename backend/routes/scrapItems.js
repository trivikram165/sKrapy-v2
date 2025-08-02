const express = require('express');
const router = express.Router();
const ScrapItem = require('../models/ScrapItem');

// @route   GET /api/scrap-items
// @desc    Get all scrap items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, isActive } = req.query;
    
    // Build filter object
    let filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const scrapItems = await ScrapItem.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: scrapItems.length,
      data: scrapItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   GET /api/scrap-items/:id
// @desc    Get single scrap item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const scrapItem = await ScrapItem.findById(req.params.id);
    
    if (!scrapItem) {
      return res.status(404).json({
        success: false,
        message: 'Scrap item not found'
      });
    }

    res.json({
      success: true,
      data: scrapItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   POST /api/scrap-items
// @desc    Create a scrap item
// @access  Public
router.post('/', async (req, res) => {
  try {
    const scrapItem = await ScrapItem.create(req.body);
    
    res.status(201).json({
      success: true,
      data: scrapItem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message
    });
  }
});

// @route   PUT /api/scrap-items/:id
// @desc    Update scrap item
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const scrapItem = await ScrapItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!scrapItem) {
      return res.status(404).json({
        success: false,
        message: 'Scrap item not found'
      });
    }

    res.json({
      success: true,
      data: scrapItem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message
    });
  }
});

// @route   DELETE /api/scrap-items/:id
// @desc    Delete scrap item
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const scrapItem = await ScrapItem.findByIdAndDelete(req.params.id);

    if (!scrapItem) {
      return res.status(404).json({
        success: false,
        message: 'Scrap item not found'
      });
    }

    res.json({
      success: true,
      message: 'Scrap item deleted successfully'
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
