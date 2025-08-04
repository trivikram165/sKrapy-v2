# Order Management Documentation

## Overview
This document details the comprehensive order management system in sKrapy-v2, including order lifecycle, cancellation features, vendor workflows, and status management.

## Table of Contents
1. [Order Lifecycle](#order-lifecycle)
2. [Order Cancellation System](#order-cancellation-system)
3. [Status Management](#status-management)
4. [Vendor Workflow](#vendor-workflow)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Components](#frontend-components)
8. [Business Logic](#business-logic)

---

## Order Lifecycle

### Complete Order Flow
```
User Creates Order → Vendor Accepts → Work Starts → Payment → Completion
     ↓                    ↓              ↓           ↓         ↓
  [pending]         [accepted]    [in_progress] [payment_pending] [completed]
     ↓
  [cancelled_by_user] ← User can cancel before payment
```

### Status Definitions
- **pending**: Order created, waiting for vendor acceptance
- **accepted**: Vendor has accepted the order
- **in_progress**: Vendor has started working on the order
- **payment_pending**: Work completed, payment processing
- **completed**: Order fully completed and paid
- **cancelled**: Order cancelled by vendor
- **cancelled_by_user**: Order cancelled by user (new feature)

### Transition Rules
```javascript
// Valid status transitions
pending → [accepted, cancelled_by_user]
accepted → [in_progress, cancelled, cancelled_by_user]
in_progress → [payment_pending, cancelled]
payment_pending → [completed]
completed → [no transitions]
cancelled → [no transitions]
cancelled_by_user → [no transitions]
```

---

## Order Cancellation System

### User Cancellation Features
- **Pre-payment Cancellation**: Users can cancel orders before payment stage
- **Reason Collection**: Optional cancellation reason collection
- **Audit Trail**: Complete tracking of who cancelled when and why
- **Vendor Notification**: Vendors are notified of user cancellations

### Cancellation Rules
```javascript
// Orders that can be cancelled by users
const canCancelOrder = (order) => {
  return ['pending', 'accepted', 'in_progress'].includes(order.status);
};

// Orders that cannot be cancelled
const cannotCancel = ['payment_pending', 'completed', 'cancelled', 'cancelled_by_user'];
```

### Backend Implementation
```javascript
// Order cancellation method
orderSchema.methods.cancelByUser = function(reason = null) {
  this.status = 'cancelled_by_user';
  this.cancelledBy = 'user';
  this.cancelledAt = new Date();
  if (reason) {
    this.cancellationReason = reason;
  }
};
```

### Frontend Cancellation UI
```jsx
// Cancel button logic
const canCancelOrder = (order) => {
  return ['pending', 'accepted', 'in_progress'].includes(order.status);
};

// Cancellation handler
const handleCancelOrder = async (orderId) => {
  const confirmed = window.confirm('Are you sure you want to cancel this order?');
  if (confirmed) {
    // API call to cancel order
    // Update UI state
    // Show success message
  }
};
```

---

## Status Management

### Database Status Enum
```javascript
status: {
  type: String,
  enum: [
    'pending', 
    'accepted', 
    'in_progress', 
    'payment_pending', 
    'completed', 
    'cancelled', 
    'cancelled_by_user'
  ],
  default: 'pending'
}
```

### Status Display Logic
```javascript
// Frontend status display
const getStatusDisplay = (order) => {
  switch (order.status) {
    case 'cancelled_by_user':
      return {
        status: 'Cancelled by User',
        action: 'Cancelled',
        color: 'text-red-600'
      };
    case 'pending':
      return {
        status: 'Pending',
        action: 'Cancel Order',
        color: 'text-yellow-600'
      };
    // ... other statuses
  }
};
```

### Status Validation
```javascript
// Prevent invalid status transitions
const validateStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    'pending': ['accepted', 'cancelled_by_user'],
    'accepted': ['in_progress', 'cancelled', 'cancelled_by_user'],
    'in_progress': ['payment_pending', 'cancelled'],
    'payment_pending': ['completed'],
    // Terminal states have no valid transitions
    'completed': [],
    'cancelled': [],
    'cancelled_by_user': []
  };
  
  return validTransitions[currentStatus]?.includes(newStatus) || false;
};
```

---

## Vendor Workflow

### Order Filtering System
Vendors can filter orders by status including the new cancellation filter:

```javascript
// Filter tabs for vendor dashboard
const filterTabs = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Available' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'payment_pending', label: 'Payment Pending' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled_by_user', label: 'Cancelled by User' }
];
```

### Cancelled Orders Display
```jsx
// Vendor view of cancelled orders
const CancelledOrderCard = ({ order }) => (
  <div className="border rounded-lg p-4 bg-red-50">
    <div className="flex justify-between items-center">
      <span className="text-red-600 font-medium">Cancelled by User</span>
      <span className="text-sm text-gray-500">
        {order.cancelledAt && new Date(order.cancelledAt).toLocaleDateString()}
      </span>
    </div>
    {order.cancellationReason && (
      <p className="text-sm text-gray-600 mt-2">
        Reason: {order.cancellationReason}
      </p>
    )}
  </div>
);
```

### Order Availability Logic
```javascript
// Orders available for vendor acceptance
const getAvailableOrders = async (vendorId) => {
  return await Order.find({
    status: 'pending',
    vendorId: null,
    hiddenFromVendors: { $ne: vendorId },
    'rejectedVendors.vendorId': { $ne: vendorId }
  });
};
```

---

## Database Schema

### Order Model Fields
```javascript
const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  vendorId: {
    type: String,
    default: null
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
    enum: ['pending', 'accepted', 'in_progress', 'payment_pending', 'completed', 'cancelled', 'cancelled_by_user'],
    default: 'pending'
  },
  // Cancellation tracking fields
  cancelledBy: {
    type: String,
    default: null // 'user' or 'vendor'
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  },
  // Vendor management fields
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
  hiddenFromVendors: [{
    type: String
  }],
  // Timestamp fields
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
```

### Database Indexes
```javascript
// Performance indexes
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ vendorId: 1, status: 1 });
orderSchema.index({ 'userAddress.pincode': 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
```

### Instance Methods
```javascript
// Cancel order by user
orderSchema.methods.cancelByUser = function(reason = null) {
  this.status = 'cancelled_by_user';
  this.cancelledBy = 'user';
  this.cancelledAt = new Date();
  if (reason) {
    this.cancellationReason = reason;
  }
};

// Check if vendor can accept order (cooldown logic)
orderSchema.methods.canVendorAccept = function(vendorId) {
  const rejection = this.rejectedVendors.find(r => r.vendorId === vendorId);
  if (!rejection) return { canAccept: true, remainingTime: 0 };
  
  const cooldownTime = 10 * 60 * 1000; // 10 minutes
  const timeSinceRejection = Date.now() - rejection.rejectedAt.getTime();
  
  if (timeSinceRejection >= cooldownTime) {
    return { canAccept: true, remainingTime: 0 };
  }
  
  const remainingTimeSeconds = Math.ceil((cooldownTime - timeSinceRejection) / 1000);
  return { canAccept: false, remainingTime: remainingTimeSeconds };
};
```

---

## API Endpoints

### Order Cancellation API
```javascript
// Cancel order endpoint
PUT /api/orders/:orderId/cancel

// Request body
{
  reason?: string  // Optional cancellation reason
}

// Response
{
  success: true,
  order: {
    _id: "...",
    status: "cancelled_by_user",
    cancelledBy: "user",
    cancelledAt: "2025-08-04T...",
    cancellationReason: "Changed mind"
  }
}

// Error responses
{
  success: false,
  message: "Order cannot be cancelled after payment"
}
```

### Order Retrieval APIs
```javascript
// Get user orders
GET /api/orders/user/:userId
// Returns all orders for a user including cancelled ones

// Get vendor orders
GET /api/orders/vendor/:vendorId
// Returns assigned orders plus available orders for acceptance
// Includes cancelled_by_user orders for filtering

// Get available orders
GET /api/orders/available
// Returns pending orders available for vendor acceptance
// Excludes cancelled orders
```

### Order Status Updates
```javascript
// Accept order
PUT /api/orders/:orderId/accept
{
  vendorId: string,
  estimatedPrice?: number
}

// Start work
PUT /api/orders/:orderId/start
// Changes status to 'in_progress'

// Request payment
PUT /api/orders/:orderId/pay
{
  finalPrice: number
}

// Complete order
PUT /api/orders/:orderId/complete
// Changes status to 'completed'
```

---

## Frontend Components

### User Order Management
```jsx
// User orders page component
const UserOrdersPage = () => {
  const [orders, setOrders] = useState([]);

  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Cancellation reason (optional):');
    
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        // Refresh orders list
        fetchOrders();
        alert('Order cancelled successfully');
      }
    } catch (error) {
      alert('Failed to cancel order');
    }
  };

  return (
    <div>
      {orders.map(order => (
        <OrderCard 
          key={order._id} 
          order={order} 
          onCancel={handleCancelOrder}
        />
      ))}
    </div>
  );
};
```

### Vendor Order Dashboard
```jsx
// Vendor orders with filtering
const VendorOrdersPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [allOrders, setAllOrders] = useState([]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return allOrders;
    if (activeTab === 'cancelled_by_user') {
      return allOrders.filter(order => order.status === 'cancelled_by_user');
    }
    return allOrders.filter(order => order.status === activeTab);
  }, [allOrders, activeTab]);

  return (
    <div>
      <FilterTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <OrdersList orders={filteredOrders} />
    </div>
  );
};
```

### Order Status Components
```jsx
// Status badge component
const StatusBadge = ({ status }) => {
  const config = {
    'cancelled_by_user': {
      label: 'Cancelled by User',
      className: 'bg-red-100 text-red-800'
    },
    'pending': {
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800'
    },
    // ... other statuses
  };

  const { label, className } = config[status] || config.pending;

  return (
    <span className={`px-2 py-1 rounded-full text-sm ${className}`}>
      {label}
    </span>
  );
};
```

---

## Business Logic

### Cancellation Rules
```javascript
// Business rules for order cancellation
const CANCELLATION_RULES = {
  // Users can cancel before payment
  userCanCancel: ['pending', 'accepted', 'in_progress'],
  
  // Orders that cannot be cancelled
  nonCancellable: ['payment_pending', 'completed', 'cancelled', 'cancelled_by_user'],
  
  // Grace period for cancellation (if needed)
  gracePeriodHours: 24,
  
  // Cancellation fee rules (if applicable)
  cancellationFee: {
    'pending': 0,
    'accepted': 0,
    'in_progress': 0.1 // 10% fee if work has started
  }
};
```

### Vendor Cooldown System
```javascript
// Prevent vendor spam by implementing cooldown
const VENDOR_COOLDOWN = {
  rejectionCooldown: 10 * 60 * 1000, // 10 minutes
  maxRejections: 3, // Max rejections per day
  banDuration: 24 * 60 * 60 * 1000 // 24 hour ban for repeated rejections
};
```

### Order Visibility Rules
```javascript
// Control which orders vendors can see
const getOrderVisibility = (order, vendorId) => {
  // Hide if vendor previously rejected (cooldown active)
  if (order.rejectedVendors.some(r => 
    r.vendorId === vendorId && 
    (Date.now() - r.rejectedAt) < VENDOR_COOLDOWN.rejectionCooldown
  )) {
    return false;
  }
  
  // Hide if vendor manually hid the order
  if (order.hiddenFromVendors.includes(vendorId)) {
    return false;
  }
  
  // Show if order is available
  return order.status === 'pending' && !order.vendorId;
};
```

---

## Error Handling

### API Error Responses
```javascript
// Cancellation errors
const CANCELLATION_ERRORS = {
  ORDER_NOT_FOUND: 'Order not found',
  UNAUTHORIZED: 'You can only cancel your own orders',
  INVALID_STATUS: 'Order cannot be cancelled in current status',
  ALREADY_PAID: 'Cannot cancel order after payment',
  SYSTEM_ERROR: 'System error occurred while cancelling order'
};
```

### Frontend Error Handling
```jsx
const handleCancelOrder = async (orderId) => {
  try {
    const response = await fetch(`/api/orders/${orderId}/cancel`, {
      method: 'PUT'
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    // Success handling
    
  } catch (error) {
    // Specific error messages based on error type
    const errorMessage = error.message.includes('payment') 
      ? 'Cannot cancel order after payment has been processed'
      : 'Failed to cancel order. Please try again.';
      
    alert(errorMessage);
  }
};
```

---

## Testing Scenarios

### User Cancellation Testing
```javascript
// Test cases for user cancellation
describe('User Order Cancellation', () => {
  test('should allow cancellation of pending orders', async () => {
    // Create pending order
    // Attempt cancellation
    // Verify status change
  });

  test('should prevent cancellation of paid orders', async () => {
    // Create completed order
    // Attempt cancellation
    // Verify error response
  });

  test('should record cancellation details', async () => {
    // Cancel order with reason
    // Verify cancelledBy, cancelledAt, cancellationReason fields
  });
});
```

### Vendor Filtering Testing
```javascript
describe('Vendor Order Filtering', () => {
  test('should show cancelled orders in cancelled filter', async () => {
    // Create cancelled order
    // Apply cancelled_by_user filter
    // Verify order appears in results
  });

  test('should exclude cancelled orders from available filter', async () => {
    // Create cancelled order
    // Apply pending filter
    // Verify order does not appear
  });
});
```

---

## Performance Considerations

### Database Optimization
```javascript
// Efficient queries for order retrieval
const getVendorOrders = async (vendorId) => {
  // Use indexes for fast filtering
  return await Order.find({
    $or: [
      { vendorId: vendorId }, // Assigned orders
      { status: 'pending', vendorId: null } // Available orders
    ]
  })
  .sort({ createdAt: -1 })
  .limit(100); // Paginate large results
};
```

### Frontend Optimization
```jsx
// Memoize filtered orders to prevent unnecessary re-renders
const filteredOrders = useMemo(() => {
  return orders.filter(order => {
    if (activeFilter === 'cancelled_by_user') {
      return order.status === 'cancelled_by_user';
    }
    return order.status === activeFilter;
  });
}, [orders, activeFilter]);
```

---

## v2.1 Order Refresh Feature

- GET /api/orders/:id now fetches latest user wallet address
- When vendor starts work, frontend refreshes order to get current wallet
- Real-time updates ensure payment modal always shows latest wallet address
- Error handling improved for missing or invalid wallet addresses

---

**Last Updated**: August 4, 2025  
**Version**: 2.0 (05-payment branch)  
**Features**: Order Cancellation, Vendor Filtering, Status Management
