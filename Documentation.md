# sKrapy-v2 Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Backend Documentation](#backend-documentation)
4. [Frontend Documentation](#frontend-documentation)
5. [Authentication & Authorization](#authentication--authorization)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Development Setup](#development-setup)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

**sKrapy-v2** is a comprehensive scrap management platform that connects users who have scrap materials with vendors who collect and process them. The platform features role-based access control, order management, and a complete vendor workflow system.

### Key Features
- **Dual Role System**: Users (scrap sellers) and Vendors (scrap collectors)
- **Authentication**: Clerk-based authentication with webhook integration
- **Order Management**: Complete lifecycle from creation to completion
- **Vendor Workflow**: Accept → Start → Pay → Completed
- **Profile Validation**: Business information validation for vendors
- **Cart System**: Multi-item scrap collection orders
- **Real-time Updates**: Order status tracking and notifications

### Tech Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS, Clerk Auth
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: Clerk with webhook integration
- **Database**: MongoDB Atlas with compound indexing
- **Deployment**: Vercel (Frontend), Render (Backend)

---

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │────│   Express API   │────│   MongoDB Atlas │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────────────┐          ┌──────────┐          ┌─────────────┐
    │ Clerk Auth │          │ Webhooks │          │ Mongoose ODM│
    └────────────┘          └──────────┘          └─────────────┘
```

### Data Flow
1. **Authentication**: Clerk handles user auth, webhooks sync user data
2. **Profile Management**: Role-based onboarding with validation
3. **Order Creation**: Users create orders, vendors manage workflow
4. **Real-time Updates**: Status changes trigger UI updates

---

## Backend Documentation

### Project Structure
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
├── package.json            # Dependencies
└── .env                    # Environment variables
```

### Environment Variables
Create `.env` file in backend directory:
```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skrapy

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Clerk Configuration
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Key Dependencies
```json
{
  "express": "^4.21.2",           // Web framework
  "mongoose": "^8.17.0",          // MongoDB ODM
  "cors": "^2.8.5",               // Cross-origin requests
  "dotenv": "^17.2.1",            // Environment variables
  "axios": "^1.11.0"              // HTTP client
}
```

### Database Models

#### User Model (`models/User.js`)
```javascript
{
  clerkId: String,              // Clerk user ID (unique)
  username: String,             // Display name
  email: String,                // User email
  firstName: String,            // First name
  lastName: String,             // Last name
  role: String,                 // 'user' or 'vendor'
  address: {                    // Location information
    fullAddress: String,
    city: String,
    state: String,
    pincode: String
  },
  // Vendor-specific fields
  businessName: String,         // Business name (vendors only)
  gstin: String,               // GSTIN number (vendors only)
  profileCompleted: Boolean,    // Profile completion status
  createdAt: Date,
  updatedAt: Date
}
```

#### Order Model (`models/Order.js`)
```javascript
{
  orderNumber: String,          // Unique order identifier
  userId: ObjectId,             // User who created order
  vendorId: ObjectId,           // Assigned vendor
  items: [{                     // Scrap items in order
    itemId: ObjectId,
    quantity: Number,
    unit: String,
    estimatedPrice: Number
  }],
  totalEstimatedPrice: Number,  // Total order value
  actualPrice: Number,          // Final price (set by vendor)
  status: String,               // Order status
  pickupAddress: {              // Pickup location
    fullAddress: String,
    city: String,
    state: String,
    pincode: String
  },
  scheduledDate: Date,          // Pickup date
  notes: String,                // Additional notes
  timestamps: {                 // Status change timestamps
    created: Date,
    accepted: Date,
    started: Date,
    paid: Date,
    completed: Date
  }
}
```

#### ScrapItem Model (`models/ScrapItem.js`)
```javascript
{
  name: String,                 // Item name (e.g., "Plastic Bottles")
  category: String,             // Category (e.g., "Plastic")
  unit: String,                 // Measurement unit (kg, pieces)
  basePrice: Number,            // Base price per unit
  description: String,          // Item description
  isActive: Boolean,            // Availability status
  createdAt: Date
}
```

### API Routes Overview

#### Users (`/api/users`)
- `POST /clerk-signup` - Create user from Clerk webhook
- `GET /:clerkId` - Get user profile
- `PUT /:clerkId` - Update user profile
- `DELETE /:clerkId` - Delete user account

#### Onboarding (`/api/onboarding`)
- `GET /check-profile/:clerkId/:role` - Check profile completion
- `POST /complete-profile` - Complete user profile

#### Orders (`/api/orders`)
- `POST /create` - Create new order
- `GET /user/:userId` - Get user's orders
- `GET /vendor/:vendorId` - Get vendor's orders
- `PUT /:orderId/accept` - Accept order (vendor)
- `PUT /:orderId/start` - Start order processing
- `PUT /:orderId/pay` - Mark as paid
- `PUT /:orderId/complete` - Complete order
- `PUT /:orderId/cancel` - Cancel order

#### Scrap Items (`/api/scrap-items`)
- `GET /` - Get all active scrap items
- `POST /` - Add new scrap item (admin)
- `PUT /:id` - Update scrap item
- `DELETE /:id` - Delete scrap item

#### Webhooks (`/api/webhooks`)
- `POST /clerk` - Handle Clerk user events

### Validation Rules

#### Profile Validation
- **All Users**: fullAddress, city, state, pincode required
- **Vendors**: businessName, gstin additionally required
- **GSTIN Format**: Exactly 15 alphanumeric characters
- **Pincode Format**: Exactly 6 digits

#### Order Validation
- **Creation**: Valid items, quantities, pickup address
- **Acceptance**: Vendor must have complete profile
- **Status Changes**: Must follow workflow sequence

### Error Handling
```javascript
// Standard error response format
{
  success: false,
  message: "Error description",
  error: "Detailed error information" // Only in development
}
```

### Security Features
- **CORS**: Configured for frontend domain only
- **Input Validation**: Mongoose schema validation
- **Authentication**: Clerk token verification
- **Data Sanitization**: Input cleaning and validation

---

## Frontend Documentation

### Project Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── auth/                # Authentication pages
│   │   ├── dashboard/           # Role-based dashboards
│   │   │   ├── user/           # User dashboard
│   │   │   └── vendor/         # Vendor dashboard
│   │   ├── onboarding/         # Profile completion
│   │   ├── api/                # API route handlers
│   │   ├── layout.js           # Root layout
│   │   ├── page.js             # Homepage
│   │   └── globals.css         # Global styles
│   ├── components/             # Reusable components
│   │   ├── OnboardingForm.jsx  # Profile completion form
│   │   ├── Header.jsx          # Navigation header
│   │   ├── Hero.jsx            # Homepage hero section
│   │   ├── HowWeWork.jsx       # Process explanation
│   │   ├── Prices.jsx          # Pricing information
│   │   ├── WhyUs.jsx           # Value proposition
│   │   └── Footer.jsx          # Site footer
│   └── middleware.js           # Clerk middleware
├── public/                     # Static assets
├── package.json               # Dependencies
├── next.config.mjs            # Next.js configuration
├── tailwind.config.js         # Tailwind CSS config
└── postcss.config.mjs         # PostCSS configuration
```

### Environment Variables
Create `.env.local` file in frontend directory:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# API Configuration (Development)
NEXT_PUBLIC_API_URL=http://localhost:3001

# API Configuration (Production)
# NEXT_PUBLIC_API_URL=https://skrapy-backend.onrender.com

# Clerk URLs (same for all environments)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/auth/role-selection
```

### Key Dependencies
```json
{
  "@clerk/nextjs": "^6.27.1",      // Authentication
  "next": "15.4.4",                // React framework
  "react": "19.1.0",               // UI library
  "react-dom": "19.1.0",           // DOM rendering
  "lucide-react": "^0.532.0",      // Icons
  "tailwindcss": "^4"              // CSS framework
}
```

### Routing Structure

#### App Router Pages
```
/                               # Homepage (Hero, Features)
/auth/sign-in                   # Sign in page
/auth/sign-up                   # Sign up page
/auth/role-selection            # Role selection after signup
/onboarding                     # Profile completion form
/dashboard/user                 # User dashboard (create orders)
/dashboard/vendor               # Vendor dashboard (manage orders)
/api/webhooks/clerk             # Clerk webhook handler
```

### Component Architecture

#### OnboardingForm Component
**Purpose**: Handles profile completion for both users and vendors

**Features**:
- Role-based field rendering
- Form validation with real-time feedback
- Pre-population for existing profiles
- GSTIN format validation for vendors
- Contextual messaging based on profile state

**Props**: None (uses Clerk user context)

**State Management**:
```javascript
const [formData, setFormData] = useState({
  fullAddress: '',
  city: '',
  state: '',
  pincode: '',
  businessName: '',  // Vendors only
  gstin: ''          // Vendors only
});

const [existingProfile, setExistingProfile] = useState(null);
const [userRole, setUserRole] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
```

**Validation Rules**:
- Address fields: Required for all users
- Business fields: Required for vendors only
- GSTIN: 15-character alphanumeric format
- Pincode: 6-digit numeric format

#### Dashboard Components
**User Dashboard**:
- Order creation interface
- Cart functionality
- Order history and tracking
- Scrap item selection

**Vendor Dashboard**:
- Incoming order notifications
- Order workflow management
- Pricing and scheduling tools
- Performance analytics

### Authentication Flow

1. **Sign Up/Sign In**: Handled by Clerk
2. **Role Selection**: User chooses "User" or "Vendor"
3. **Profile Check**: System validates profile completion
4. **Onboarding**: Complete missing profile information
5. **Dashboard Redirect**: Role-based dashboard access

### State Management Patterns

#### User Context
```javascript
// Clerk provides user context
const { user, isLoaded } = useUser();
const { isSignedIn } = useAuth();

// Role determination hierarchy
1. URL parameters (?role=vendor)
2. User metadata (publicMetadata.role)
3. localStorage (lastDashboard)
4. Default to 'user'
```

#### Form State
```javascript
// Controlled components with validation
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

// Real-time validation
const validateForm = () => {
  // Field-specific validation
  // Role-based requirements
  // Format validation (GSTIN, pincode)
};
```

### API Integration

#### Fetch Patterns
```javascript
// Standard API call pattern
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/endpoint`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data)
});

const result = await response.json();

if (result.success) {
  // Handle success
} else {
  setError(result.message);
}
```

#### Error Handling
- Network errors: Connection timeout handling
- API errors: Server-side error messages
- Validation errors: Field-specific feedback
- Loading states: User feedback during operations

### Styling Approach

#### Tailwind CSS Classes
- **Color Scheme**: Green primary (#8AC349), neutral grays
- **Typography**: Geist font family
- **Layout**: Responsive design with mobile-first approach
- **Components**: Consistent spacing and border radius

#### Custom CSS
```css
/* Global styles in globals.css */
.font-geist {
  font-family: 'Geist', sans-serif;
}

/* Responsive utilities */
@media (max-width: 768px) {
  /* Mobile-specific styles */
}
```

---

## Authentication & Authorization

### Clerk Integration

#### Setup Process
1. **Clerk Dashboard**: Create application
2. **API Keys**: Configure environment variables
3. **Webhooks**: Set up user sync endpoints
4. **Middleware**: Protect routes with auth requirements

#### User Management
```javascript
// Clerk webhook handles user lifecycle
- user.created: Create user in MongoDB
- user.updated: Sync profile changes
- user.deleted: Remove user data
```

#### Role-Based Access
```javascript
// Middleware protection
export default clerkMiddleware((auth, req) => {
  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    auth().protect();
  }
});
```

### Security Implementation

#### Route Protection
- **Public Routes**: Homepage, auth pages
- **Protected Routes**: Dashboards, profile pages
- **Role-Specific**: Vendor-only order management

#### Data Validation
- **Frontend**: Form validation with instant feedback
- **Backend**: Schema validation with Mongoose
- **Business Logic**: Role-based field requirements

---

## Database Schema

### MongoDB Collections

#### Users Collection
```javascript
// Compound index for role separation
db.users.createIndex({ clerkId: 1, role: 1 }, { unique: true });

// Query patterns
db.users.findOne({ clerkId: "user_xxx", role: "vendor" });
db.users.find({ role: "vendor", profileCompleted: true });
```

#### Orders Collection
```javascript
// Indexes for performance
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ userId: 1, status: 1 });
db.orders.createIndex({ vendorId: 1, status: 1 });

// Query patterns
db.orders.find({ vendorId: ObjectId("xxx"), status: "pending" });
db.orders.find({ userId: ObjectId("xxx") }).sort({ createdAt: -1 });
```

### Data Relationships
```
Users (1) ←→ (N) Orders
Users (Vendors) (1) ←→ (N) Orders (as vendor)
Orders (N) ←→ (N) ScrapItems (through items array)
```

---

## API Endpoints

### Complete API Reference

#### Authentication Endpoints
```
POST /api/webhooks/clerk
- Purpose: Handle Clerk user events
- Body: Clerk webhook payload
- Response: { success: true }
```

#### User Management
```
GET /api/users/:clerkId
- Purpose: Get user profile
- Response: { success: true, user: {...} }

PUT /api/users/:clerkId
- Purpose: Update user profile
- Body: { firstName, lastName, ... }
- Response: { success: true, user: {...} }

POST /api/users/clerk-signup
- Purpose: Create user from Clerk data
- Body: { clerkId, username, email, role }
- Response: { success: true, user: {...} }
```

#### Profile Management
```
GET /api/onboarding/check-profile/:clerkId/:role
- Purpose: Check if profile is complete
- Response: { 
    success: true, 
    isComplete: boolean,
    user: {...} 
  }

POST /api/onboarding/complete-profile
- Body: {
    clerkId: string,
    role: string,
    fullAddress: string,
    city: string,
    state: string,
    pincode: string,
    businessName?: string,  // vendors only
    gstin?: string          // vendors only
  }
- Response: { success: true, user: {...} }
```

#### Order Management
```
POST /api/orders/create
- Body: {
    userId: string,
    items: [{
      itemId: string,
      quantity: number,
      unit: string
    }],
    pickupAddress: {...},
    scheduledDate: string,
    notes?: string
  }
- Response: { success: true, order: {...} }

GET /api/orders/user/:userId
- Purpose: Get user's orders
- Response: { success: true, orders: [...] }

GET /api/orders/vendor/:vendorId
- Purpose: Get vendor's orders
- Response: { success: true, orders: [...] }

PUT /api/orders/:orderId/accept
- Body: { vendorId: string, actualPrice?: number }
- Response: { success: true, order: {...} }

PUT /api/orders/:orderId/start
- Purpose: Mark order as started
- Response: { success: true, order: {...} }

PUT /api/orders/:orderId/pay
- Body: { actualPrice: number }
- Response: { success: true, order: {...} }

PUT /api/orders/:orderId/complete
- Purpose: Mark order as completed
- Response: { success: true, order: {...} }

PUT /api/orders/:orderId/cancel
- Body: { reason?: string }
- Response: { success: true, order: {...} }
```

#### Scrap Items
```
GET /api/scrap-items
- Purpose: Get all active scrap items
- Response: { success: true, items: [...] }

POST /api/scrap-items
- Body: {
    name: string,
    category: string,
    unit: string,
    basePrice: number,
    description?: string
  }
- Response: { success: true, item: {...} }
```

### Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

---

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- Clerk account for authentication
- Git for version control

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB and Clerk credentials

# Start development server
npm run dev
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# Edit .env.local with your Clerk keys

# Start development server
npm run dev
```

### Database Setup
```bash
# Connect to MongoDB and create indexes
cd backend
node fix-indexes.js

# The script will create necessary compound indexes
```

### Development Workflow

1. **Start Backend**: `cd backend && npm run dev` (Port 3001)
2. **Start Frontend**: `cd frontend && npm run dev` (Port 3000)
3. **Test Authentication**: Sign up as user/vendor
4. **Complete Profiles**: Fill onboarding forms
5. **Test Order Flow**: Create orders, vendor workflow

### Environment Configuration

#### Development
```env
# Backend (.env)
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/skrapy-dev
FRONTEND_URL=http://localhost:3000

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Production
```env
# Backend (.env)
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
FRONTEND_URL=https://your-domain.com

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

---

## Deployment

### Backend Deployment (Render)

#### Prepare for Deployment
1. **Connect Repository**: Link your GitHub repository to Render
2. **Configure Build Settings**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

#### Environment Variables Setup
Set these in Render Dashboard → Environment:
```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=your-mongodb-connection-string
FRONTEND_URL=https://your-app.vercel.app
CLERK_WEBHOOK_SECRET=whsec_your-webhook-secret
```

#### Auto-Deploy Configuration
- Render automatically deploys on git push to main branch
- Monitor deployment logs in Render dashboard
- Health checks available at `/api/health`

### Frontend Deployment (Vercel)

#### Vercel Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": "@clerk-publishable-key",
    "CLERK_SECRET_KEY": "@clerk-secret-key",
    "NEXT_PUBLIC_API_URL": "@api-url"
  }
}
```

#### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Database Deployment

#### MongoDB Atlas Setup
1. Create cluster on MongoDB Atlas
2. Configure network access (IP whitelist)
3. Create database user with read/write permissions
4. Get connection string for application

#### Index Creation
```javascript
// Run after deployment to ensure indexes exist
db.users.createIndex({ clerkId: 1, role: 1 }, { unique: true });
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ userId: 1, status: 1 });
db.orders.createIndex({ vendorId: 1, status: 1 });
```

### Health Checks

#### Backend Health Check
```bash
curl https://api.your-domain.com/api/health
# Expected response: { "success": true, "message": "sKrapy API is running!" }
```

#### Frontend Health Check
```bash
curl https://your-domain.com
# Should return 200 status with homepage content
```

---

## Troubleshooting

### Common Issues

#### Authentication Issues
**Problem**: "Authentication required" errors
**Solution**: 
- Check Clerk environment variables
- Verify webhook URLs in Clerk dashboard
- Ensure middleware.js is properly configured

#### Database Connection Issues
**Problem**: "MongoDB connection failed"
**Solution**:
- Verify MongoDB URI in environment variables
- Check network access settings in MongoDB Atlas
- Ensure database user has proper permissions

#### CORS Issues
**Problem**: "Cross-origin request blocked"
**Solution**:
- Update CORS configuration in server.js
- Verify FRONTEND_URL environment variable
- Check browser developer tools for exact error

#### Profile Completion Issues
**Problem**: Users stuck on onboarding
**Solution**:
- Check profile validation logic
- Verify all required fields are submitted
- Test with browser developer tools network tab

#### Order Management Issues
**Problem**: Order status not updating
**Solution**:
- Check order workflow sequence
- Verify vendor profile completion
- Test API endpoints with Postman

### Debugging Tools

#### Backend Debugging
```javascript
// Add console.log statements
console.log('Request body:', req.body);
console.log('User data:', user);

// Use Morgan for request logging
const morgan = require('morgan');
app.use(morgan('combined'));
```

#### Frontend Debugging
```javascript
// Browser console debugging
console.log('Form data:', formData);
console.log('API response:', response);

// React Developer Tools
// Clerk Developer Tools
```

#### Database Debugging
```javascript
// MongoDB query debugging
db.users.find({ clerkId: "user_xxx" }).explain("executionStats");

// Mongoose debugging
mongoose.set('debug', true);
```

### Performance Optimization

#### Backend Optimization
- **Indexing**: Ensure proper database indexes
- **Caching**: Implement Redis for frequently accessed data
- **Connection Pooling**: Configure MongoDB connection pools
- **Rate Limiting**: Implement API rate limiting

#### Frontend Optimization
- **Code Splitting**: Use dynamic imports for large components
- **Image Optimization**: Next.js Image component for assets
- **Bundle Analysis**: Analyze bundle size with webpack-bundle-analyzer
- **Caching**: Implement proper caching strategies

### Monitoring and Logging

#### Production Monitoring
- **Error Tracking**: Implement Sentry or similar
- **Performance Monitoring**: Use APM tools
- **Uptime Monitoring**: Set up health check monitoring
- **Log Management**: Centralized logging with ELK stack

#### Key Metrics to Monitor
- **API Response Times**: Track endpoint performance
- **Error Rates**: Monitor 4xx and 5xx responses
- **Database Performance**: Query execution times
- **User Authentication**: Sign-up and sign-in success rates

---

## Conclusion

This documentation provides comprehensive guidance for developing, deploying, and maintaining the sKrapy-v2 platform. The system is designed with scalability and maintainability in mind, featuring:

- **Modular Architecture**: Clear separation of concerns
- **Role-Based Access**: Flexible user management
- **Comprehensive Validation**: Data integrity at all levels
- **Production-Ready**: Deployment and monitoring guidelines

For additional support or questions, refer to the inline code comments or create an issue in the project repository.

---

*Documentation Version: 1.0.0*  
*Last Updated: August 3, 2025*
