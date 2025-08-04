const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');

// @route   POST /api/orders
// @desc    Create new order
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { userId, items, totalAmount, totalItems } = req.body;

    // Get user address
    const user = await User.findOne({ clerkId: userId, role: 'user' });
    if (!user || !user.profileCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile setup first to place orders',
        redirectTo: '/onboarding?role=user'
      });
    }

    // Generate unique order number with timestamp to avoid duplicates
    const timestamp = Date.now();
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD${String(orderCount + 1).padStart(6, '0')}-${timestamp.toString().slice(-4)}`;

    // Create order
    const order = await Order.create({
      orderNumber,
      userId,
      userWalletAddress: user.walletAddress,
      userAddress: user.address,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit || 'kg',
        total: item.price * item.quantity
      })),
      totalAmount,
      totalItems
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// @route   GET /api/orders/user/:userId
// @desc    Get orders for a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// @route   GET /api/orders/vendor/:vendorId
// @desc    Get orders for a specific vendor (accepted orders)
// @access  Public
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const orders = await Order.find({ vendorId }).sort({ acceptedAt: -1 });

    // Get user details for each order
    const ordersWithUserData = await Promise.all(
      orders.map(async (order) => {
        const user = await User.findOne({ clerkId: order.userId, role: 'user' });
        const userName = user ? `${user.firstName} ${user.lastName}`.trim() || user.username : `User ${order.userId.slice(-4)}`;
        const userWalletAddress = user ? user.walletAddress : null;
        return {
          ...order.toObject(),
          userName,
          userWalletAddress
        };
      })
    );

    res.json({
      success: true,
      count: ordersWithUserData.length,
      data: ordersWithUserData
    });
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor orders',
      error: error.message
    });
  }
});

// @route   GET /api/orders/available/:pincode/:vendorId
// @desc    Get available orders for a vendor's pincode (with cooldown info)
// @access  Public
router.get('/available/:pincode/:vendorId', async (req, res) => {
  try {
    const { pincode, vendorId } = req.params;
    
    // Get pending orders
    const pendingOrders = await Order.find({ 
      'userAddress.pincode': pincode,
      status: 'pending',
      vendorId: null,
      hiddenFromVendors: { $ne: vendorId }
    }).sort({ createdAt: -1 });

    // Get cancelled_by_user orders in this vendor's area
    const cancelledOrders = await Order.find({
      'userAddress.pincode': pincode,
      status: 'cancelled_by_user'
    }).sort({ createdAt: -1 });

    // Combine orders
    const allOrders = [...pendingOrders, ...cancelledOrders];

    // Get user details for each order and add cooldown info
    const ordersWithUserData = await Promise.all(
      allOrders.map(async (order) => {
        const user = await User.findOne({ clerkId: order.userId, role: 'user' });
        const userName = user ? `${user.firstName} ${user.lastName}`.trim() || user.username : `User ${order.userId.slice(-4)}`;
        
        // Check cooldown status for this vendor (only for pending orders)
        const cooldownCheck = order.status === 'pending' ? order.canVendorAccept(vendorId) : { canAccept: false, remainingTime: 0 };
        
        return {
          ...order.toObject(),
          userName,
          canAccept: cooldownCheck.canAccept,
          remainingCooldown: cooldownCheck.remainingTime
        };
      })
    );

    res.json({
      success: true,
      count: ordersWithUserData.length,
      data: ordersWithUserData
    });
  } catch (error) {
    console.error('Get available orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available orders',
      error: error.message
    });
  }
});

// @route   GET /api/orders/available/:pincode
// @desc    Get available orders for a vendor's pincode (legacy route)
// @access  Public
router.get('/available/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    const orders = await Order.find({ 
      'userAddress.pincode': pincode,
      status: 'pending',
      vendorId: null
    }).sort({ createdAt: -1 });

    // Get user details for each order
    const ordersWithUserData = await Promise.all(
      orders.map(async (order) => {
        const user = await User.findOne({ clerkId: order.userId, role: 'user' });
        const userName = user ? `${user.firstName} ${user.lastName}`.trim() || user.username : `User ${order.userId.slice(-4)}`;
        return {
          ...order.toObject(),
          userName
        };
      })
    );

    res.json({
      success: true,
      count: ordersWithUserData.length,
      data: ordersWithUserData
    });
  } catch (error) {
    console.error('Get available orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available orders',
      error: error.message
    });
  }
});

// @route   PUT /api/orders/:orderId/accept
// @desc    Accept an order (vendor)
// @access  Public
router.put('/:orderId/accept', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { vendorId } = req.body;

    // Check if vendor profile is complete
    const vendor = await User.findOne({ clerkId: vendorId, role: 'vendor' });
    if (!vendor || !vendor.profileCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your vendor profile first',
        redirectTo: '/onboarding?role=vendor'
      });
    }

    // Validate vendor-specific fields
    const hasRequiredVendorFields = vendor.businessName && 
                                   vendor.businessName.trim() !== '' && 
                                   vendor.gstin && 
                                   vendor.gstin.trim() !== '' &&
                                   /^[0-9A-Z]{15}$/.test(vendor.gstin);

    if (!hasRequiredVendorFields) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your business information (business name and GSTIN) first',
        redirectTo: '/onboarding?role=vendor'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'pending' || order.vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Order is no longer available'
      });
    }

    // Check if vendor is in cooldown period
    const cooldownCheck = order.canVendorAccept(vendorId);
    if (!cooldownCheck.canAccept) {
      const minutes = Math.floor(cooldownCheck.remainingTime / 60);
      const seconds = cooldownCheck.remainingTime % 60;
      const timeString = minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} second${seconds > 1 ? 's' : ''}` : `${seconds} second${seconds > 1 ? 's' : ''}`;
      
      return res.status(429).json({
        success: false,
        message: `You cannot accept this order yet. Please wait ${timeString} before trying again.`,
        remainingTime: cooldownCheck.remainingTime,
        cooldownActive: true
      });
    }

    order.vendorId = vendorId;
    order.status = 'accepted';
    order.acceptedAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: 'Order accepted successfully',
      data: order
    });
  } catch (error) {
    console.error('Accept order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept order',
      error: error.message
    });
  }
});

// @route   PUT /api/orders/:orderId/status
// @desc    Update order status
// @access  Public
router.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    if (status === 'completed') {
      order.completedAt = new Date();
    }
    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// @route   PUT /api/orders/:orderId/reject
// @desc    Reject an order (vendor)
// @access  Public
router.put('/:orderId/reject', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { vendorId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow rejection if vendor has accepted the order
    if (order.vendorId !== vendorId || order.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'You can only reject orders you have accepted'
      });
    }

    // Add vendor to rejected list and reset order
    order.rejectByVendor(vendorId);
    await order.save();

    res.json({
      success: true,
      message: 'Order rejected successfully. You can accept this order again after 10 minutes.',
      data: order
    });
  } catch (error) {
    console.error('Reject order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject order',
      error: error.message
    });
  }
});

// @route   PUT /api/orders/:orderId/cancel
// @desc    Cancel an order (user)
// @access  Public
router.put('/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow cancellation by the user who placed the order
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own orders'
      });
    }

    // Don't allow cancellation if already completed or cancelled
    if (order.status === 'completed' || order.status === 'cancelled' || order.status === 'cancelled_by_user') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order that is already completed or cancelled'
      });
    }

    // Cancel the order
    order.cancelByUser(reason);
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

module.exports = router;