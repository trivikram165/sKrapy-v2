# Backend API Documentation

## Overview
The sKrapy-v2 backend is a RESTful API built with Node.js, Express.js, and MongoDB. It handles authentication, user management, order processing, and vendor workflow management.

## Quick Start

### Installation
```bash
cd backend
npm install
```

### Environment Setup
Create `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skrapy
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Run Development Server
```bash
npm run dev
```

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── User.js             # User/Vendor profiles
│   ├── Order.js            # Order management
│   └── ScrapItem.js        # Scrap material types
├── routes/
│   ├── users.js            # User CRUD operations
│   ├── onboarding.js       # Profile completion
│   ├── orders.js           # Order management
│   ├── scrapItems.js       # Scrap material data
│   └── webhooks.js         # Clerk webhooks
├── server.js               # Express app entry point
├── fix-indexes.js          # Database index setup
└── package.json            # Dependencies
```

## Database Models

### User Model
```javascript
const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  role: {
    type: String,
    enum: ['user', 'vendor'],
    required: true
  },
  address: {
    fullAddress: String,
    city: String,
    state: String,
    pincode: String
  },
  // Vendor-specific fields
  businessName: {
    type: String,
    required: function() {
      return this.role === 'vendor';
    }
  },
  gstin: {
    type: String,
    required: function() {
      return this.role === 'vendor';
    },
    validate: {
      validator: function(v) {
        if (this.role !== 'vendor') return true;
        return /^[0-9A-Z]{15}$/.test(v);
      },
      message: 'GSTIN must be exactly 15 alphanumeric characters'
    }
  },
  profileCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for role separation
userSchema.index({ clerkId: 1, role: 1 }, { unique: true });
```

### Order Model
```javascript
const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  items: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScrapItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.1
    },
    unit: {
      type: String,
      required: true
    },
    estimatedPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  totalEstimatedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  actualPrice: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'started', 'paid', 'completed', 'cancelled'],
    default: 'pending'
  },
  pickupAddress: {
    fullAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  notes: String,
  timestamps: {
    created: { type: Date, default: Date.now },
    accepted: Date,
    started: Date,
    paid: Date,
    completed: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ vendorId: 1, status: 1 });
```

### ScrapItem Model
```javascript
const scrapItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'pieces', 'tons', 'liters']
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});
```

## API Endpoints

### Authentication & User Management

#### Create User (Webhook)
```http
POST /api/users/clerk-signup
Content-Type: application/json

{
  "clerkId": "user_2ABC123DEF456",
  "username": "john_doe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "vendor"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "64abc123def456789",
    "clerkId": "user_2ABC123DEF456",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "vendor",
    "profileCompleted": false,
    "createdAt": "2025-08-03T10:30:00.000Z"
  }
}
```

#### Get User Profile
```http
GET /api/users/user_2ABC123DEF456
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "64abc123def456789",
    "clerkId": "user_2ABC123DEF456",
    "username": "john_doe",
    "role": "vendor",
    "address": {
      "fullAddress": "123 Business Street",
      "city": "Mumbai",
      "state": "Maharashtra", 
      "pincode": "400001"
    },
    "businessName": "John's Scrap Co",
    "gstin": "27AAAAA0000A1Z5",
    "profileCompleted": true
  }
}
```

### Profile Management

#### Check Profile Completion
```http
GET /api/onboarding/check-profile/user_2ABC123DEF456/vendor
```

**Response:**
```json
{
  "success": true,
  "isComplete": true,
  "user": {
    "clerkId": "user_2ABC123DEF456",
    "role": "vendor",
    "address": {
      "fullAddress": "123 Business Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "businessName": "John's Scrap Co",
    "gstin": "27AAAAA0000A1Z5"
  }
}
```

#### Complete Profile
```http
POST /api/onboarding/complete-profile
Content-Type: application/json

{
  "clerkId": "user_2ABC123DEF456",
  "role": "vendor",
  "fullAddress": "123 Business Street, Andheri East",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400069",
  "businessName": "John's Scrap Co",
  "gstin": "27AAAAA0000A1Z5"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile completed successfully",
  "user": {
    "_id": "64abc123def456789",
    "profileCompleted": true,
    "address": {
      "fullAddress": "123 Business Street, Andheri East",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400069"
    },
    "businessName": "John's Scrap Co",
    "gstin": "27AAAAA0000A1Z5"
  }
}
```

### Order Management

#### Create Order
```http
POST /api/orders/create
Content-Type: application/json

{
  "userId": "64abc123def456789",
  "items": [
    {
      "itemId": "64def456ghi789012",
      "quantity": 5,
      "unit": "kg",
      "estimatedPrice": 50
    }
  ],
  "totalEstimatedPrice": 50,
  "pickupAddress": {
    "fullAddress": "456 Pickup Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "scheduledDate": "2025-08-05T10:00:00.000Z",
  "notes": "Please call before arriving"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "_id": "64ghi789jkl012345",
    "orderNumber": "ORD-1722691800123-001",
    "userId": "64abc123def456789",
    "status": "pending",
    "items": [
      {
        "itemId": "64def456ghi789012",
        "quantity": 5,
        "unit": "kg",
        "estimatedPrice": 50
      }
    ],
    "totalEstimatedPrice": 50,
    "scheduledDate": "2025-08-05T10:00:00.000Z",
    "timestamps": {
      "created": "2025-08-03T10:30:00.000Z"
    }
  }
}
```

#### Accept Order (Vendor)
```http
PUT /api/orders/64ghi789jkl012345/accept
Content-Type: application/json

{
  "vendorId": "64abc123def456789",
  "actualPrice": 55
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "_id": "64ghi789jkl012345",
    "orderNumber": "ORD-1722691800123-001",
    "vendorId": "64abc123def456789",
    "status": "accepted",
    "actualPrice": 55,
    "timestamps": {
      "created": "2025-08-03T10:30:00.000Z",
      "accepted": "2025-08-03T11:00:00.000Z"
    }
  }
}
```

#### Update Order Status
```http
PUT /api/orders/64ghi789jkl012345/start
```

**Response:**
```json
{
  "success": true,
  "order": {
    "_id": "64ghi789jkl012345",
    "status": "started",
    "timestamps": {
      "created": "2025-08-03T10:30:00.000Z",
      "accepted": "2025-08-03T11:00:00.000Z",
      "started": "2025-08-03T11:30:00.000Z"
    }
  }
}
```

#### Cancel Order (User)
```http
PUT /api/orders/64ghi789jkl012345/cancel
Content-Type: application/json

{
  "reason": "Changed my mind about selling these items"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "_id": "64ghi789jkl012345",
    "orderNumber": "ORD-1722691800123-001",
    "status": "cancelled_by_user",
    "cancelledBy": "user",
    "cancelledAt": "2025-08-04T12:00:00.000Z",
    "cancellationReason": "Changed my mind about selling these items",
    "timestamps": {
      "created": "2025-08-03T10:30:00.000Z",
      "accepted": "2025-08-03T11:00:00.000Z"
    }
  }
}
```

**Error Response (Cannot Cancel):**
```json
{
  "success": false,
  "message": "Order cannot be cancelled after payment"
}
```

**Cancellation Rules:**
- Users can only cancel their own orders
- Orders can be cancelled in status: `pending`, `accepted`, `in_progress`
- Orders cannot be cancelled in status: `payment_pending`, `completed`, `cancelled`, `cancelled_by_user`
- Cancellation reason is optional but recommended for analytics

#### Get User's Orders
```http
GET /api/orders/user/64abc123def456789
```

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "64ghi789jkl012345",
      "orderNumber": "ORD-1722691800123-001",
      "status": "started",
      "totalEstimatedPrice": 50,
      "actualPrice": 55,
      "scheduledDate": "2025-08-05T10:00:00.000Z",
      "vendor": {
        "_id": "64abc123def456789",
        "businessName": "John's Scrap Co"
      }
    }
  ]
}
```

#### Get Vendor's Orders
```http
GET /api/orders/vendor/64abc123def456789
```

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "64ghi789jkl012345",
      "orderNumber": "ORD-1722691800123-001",
      "status": "started",
      "totalEstimatedPrice": 50,
      "actualPrice": 55,
      "scheduledDate": "2025-08-05T10:00:00.000Z",
      "user": {
        "_id": "64def456ghi789012",
        "firstName": "Jane",
        "lastName": "Smith"
      }
    }
  ]
}
```

### Scrap Items Management

#### Get All Scrap Items
```http
GET /api/scrap-items
```

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "_id": "64def456ghi789012",
      "name": "Plastic Bottles",
      "category": "Plastic",
      "unit": "kg",
      "basePrice": 10,
      "description": "Clear plastic bottles, clean and dry",
      "isActive": true
    },
    {
      "_id": "64ghi789jkl012345",
      "name": "Aluminum Cans",
      "category": "Metal",
      "unit": "kg",
      "basePrice": 15,
      "description": "Aluminum beverage cans",
      "isActive": true
    }
  ]
}
```

#### Add Scrap Item
```http
POST /api/scrap-items
Content-Type: application/json

{
  "name": "Copper Wire",
  "category": "Metal",
  "unit": "kg",
  "basePrice": 300,
  "description": "Pure copper electrical wire"
}
```

**Response:**
```json
{
  "success": true,
  "item": {
    "_id": "64jkl012mno345678",
    "name": "Copper Wire",
    "category": "Metal",
    "unit": "kg",
    "basePrice": 300,
    "description": "Pure copper electrical wire",
    "isActive": true,
    "createdAt": "2025-08-03T10:30:00.000Z"
  }
}
```

## Webhooks

### Clerk Webhook Handler
```http
POST /api/webhooks/clerk
Content-Type: application/json
svix-id: msg_1234567890
svix-signature: v1,signature_here
svix-timestamp: 1722691800

{
  "type": "user.created",
  "data": {
    "id": "user_2ABC123DEF456",
    "username": "john_doe",
    "email_addresses": [
      {
        "email_address": "john@example.com"
      }
    ],
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description for user",
  "error": "Detailed error information (development only)"
}
```

### Common Error Codes

#### 400 Bad Request
```json
{
  "success": false,
  "message": "GSTIN must be exactly 15 alphanumeric characters",
  "field": "gstin"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error occurred"
}
```

## Validation Rules

### User Validation
- **clerkId**: Required, unique per role
- **email**: Required, valid email format
- **role**: Must be 'user' or 'vendor'
- **address**: All fields required when provided
- **pincode**: Exactly 6 digits
- **businessName**: Required for vendors
- **gstin**: Optional for vendors, if provided must be exactly 15 alphanumeric characters

### Order Validation
- **items**: At least one item required
- **quantity**: Must be positive number
- **scheduledDate**: Must be future date
- **pickupAddress**: All address fields required
- **status transitions**: Must follow workflow sequence

### Business Rules
- Vendors must have complete profiles to accept orders
- Order numbers are auto-generated with timestamp + sequence
- GSTIN format validation for Indian tax compliance
- Status transitions follow vendor workflow: pending → accepted → started → paid → completed

## Security Features

### Input Validation
- Mongoose schema validation
- Custom validation functions
- Sanitization of user inputs
- GSTIN format verification

### Authentication
- Clerk webhook signature verification
- Protected route middleware
- Role-based access control

### Data Protection
- Environment variable security
- CORS configuration
- Request size limits
- Error message sanitization

## Performance Optimization

### Database Indexing
```javascript
// Compound indexes for efficient queries
db.users.createIndex({ clerkId: 1, role: 1 }, { unique: true });
db.orders.createIndex({ userId: 1, status: 1 });
db.orders.createIndex({ vendorId: 1, status: 1 });
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
```

### Query Optimization
- Use projection to limit returned fields
- Populate only necessary referenced data
- Implement pagination for large result sets
- Cache frequently accessed scrap items

### Connection Management
- MongoDB connection pooling
- Connection retry logic
- Graceful shutdown handling

## Testing

### API Testing with curl
```bash
# Health check
curl -X GET http://localhost:3001/api/health

# Create user
curl -X POST http://localhost:3001/api/users/clerk-signup \
  -H "Content-Type: application/json" \
  -d '{"clerkId":"user_test","username":"testuser","email":"test@example.com","role":"vendor"}'

# Complete profile
curl -X POST http://localhost:3001/api/onboarding/complete-profile \
  -H "Content-Type: application/json" \
  -d '{"clerkId":"user_test","role":"vendor","fullAddress":"Test Address","city":"Mumbai","state":"Maharashtra","pincode":"400001","businessName":"Test Business","gstin":"27AAAAA0000A1Z5"}'
```

### Postman Collection
Import the following collection for comprehensive API testing:
```json
{
  "info": {
    "name": "sKrapy API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001/api"
    }
  ]
}
```

## Development Guidelines

### Code Style
- Use async/await for asynchronous operations
- Implement proper error handling with try-catch
- Add descriptive comments for complex logic
- Follow RESTful API conventions

### Database Operations
- Always validate input before database operations
- Use transactions for multi-document operations
- Implement proper error handling for database failures
- Add logging for debugging purposes

### API Design
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Return consistent response formats
- Implement proper status codes
- Add request/response logging

---

*Backend Documentation Version: 1.0.0*  
*Last Updated: August 3, 2025*

## v2.1 Endpoint Updates

- GET /api/orders/:id now returns latest user wallet address from User model
- Response structure: { success, data: { ...order, userWalletAddress } }
- Frontend refreshes order after status change to get latest wallet address
- Error handling and response documentation updated
