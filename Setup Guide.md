# sKrapy-v2 Setup Guide

## Quick Setup Guide

This guide will help you get the sKrapy-v2 project running locally in under 10 minutes.

## Prerequisites

- **Node.js 18+** and npm
- **MongoDB Atlas account** (free tier available)
- **Clerk account** for authentication (free tier available)
- **Git** for version control

## 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd sKrapy-v2

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## 2. Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**: Visit [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Create a Cluster**: Choose free tier (M0)
3. **Create Database User**: 
   - Go to Database Access
   - Add new user with read/write permissions
   - Remember username and password
4. **Configure Network Access**:
   - Go to Network Access
   - Add IP address (use 0.0.0.0/0 for development)
5. **Get Connection String**:
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<dbname>`

## 3. Authentication Setup (Clerk)

1. **Create Clerk Account**: Visit [clerk.com](https://clerk.com)
2. **Create New Application**:
   - Choose application type: "Next.js"
   - Note down the API keys
3. **Configure Sign-in Methods**:
   - Enable Email/Password
   - Enable any social providers you want
4. **Set up Webhooks**:
   - Go to Webhooks in Clerk dashboard
   - Add endpoint: `http://localhost:3001/api/webhooks/clerk`
   - Select events: `user.created`, `user.updated`, `user.deleted`
   - Copy the webhook secret

## 4. Environment Configuration

### Backend Environment (.env)
Create `backend/.env` file:
```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skrapy

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Clerk Webhook
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Frontend Environment (.env.local)
Create `frontend/.env.local` file:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Clerk URLs (default values)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/auth/role-selection
```

## 5. Database Initialization

```bash
# Navigate to backend directory
cd backend

# Run database index setup (one-time setup)
node fix-indexes.js
```

This script creates necessary indexes for:
- User role separation
- Order number uniqueness
- Query performance optimization

## 6. Start Development Servers

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Backend will start on http://localhost:3001

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
Frontend will start on http://localhost:3000

## 7. Test the Setup

1. **Visit Frontend**: Open http://localhost:3000
2. **Check Backend**: Visit http://localhost:3001/api/health
3. **Test Authentication**:
   - Click "Sign Up"
   - Create a test account
   - Choose "Vendor" role
   - Complete the onboarding form
   - Verify you reach the vendor dashboard

## 8. Sample Data (Optional)

Add sample scrap items to test the system:

```bash
# Use curl or Postman to add sample items
curl -X POST http://localhost:3001/api/scrap-items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Plastic Bottles",
    "category": "Plastic",
    "unit": "kg",
    "basePrice": 10,
    "description": "Clear plastic bottles, clean and dry"
  }'

curl -X POST http://localhost:3001/api/scrap-items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aluminum Cans",
    "category": "Metal",
    "unit": "kg", 
    "basePrice": 15,
    "description": "Aluminum beverage cans"
  }'
```

## 9. Verification Checklist

- [ ] Backend health check returns success
- [ ] Frontend loads without errors
- [ ] User can sign up and sign in
- [ ] Role selection works (User/Vendor)
- [ ] Onboarding form validation works
- [ ] Profile completion redirects to dashboard
- [ ] Database connection is stable
- [ ] Clerk webhooks are receiving events

## Common Issues and Solutions

### Issue: MongoDB Connection Failed
**Solution**: 
- Check connection string format
- Verify username/password
- Ensure IP address is whitelisted
- Check network connectivity

### Issue: Clerk Authentication Not Working
**Solution**:
- Verify API keys are correct
- Check environment file names (.env.local for frontend)
- Ensure webhook URL is accessible
- Test webhook endpoint manually

### Issue: CORS Errors
**Solution**:
- Verify FRONTEND_URL in backend .env
- Check browser console for exact error
- Ensure both servers are running

### Issue: Form Validation Errors
**Solution**:
- Check browser console for JavaScript errors
- Verify API endpoints are responding
- Test individual form fields

## Project Structure Overview

```
sKrapy-v2/
├── backend/                 # Express.js API server
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── config/             # Database configuration
│   └── server.js           # Entry point
├── frontend/               # Next.js application
│   ├── src/app/           # App Router pages
│   ├── src/components/    # React components
│   └── src/middleware.js  # Clerk middleware
├── DOCUMENTATION.md        # Complete documentation
├── backend/API_DOCUMENTATION.md
└── frontend/FRONTEND_DOCUMENTATION.md
```

## Key Features to Test

1. **User Registration & Authentication**
2. **Role-based Onboarding** (User vs Vendor)
3. **Profile Validation** (GSTIN for vendors)
4. **Form Pre-population** (for existing users)
5. **Dashboard Access Control**

## Next Steps

After setup is complete:

1. **Read the Documentation**: 
   - `DOCUMENTATION.md` - Complete project overview
   - `backend/API_DOCUMENTATION.md` - API reference
   - `frontend/FRONTEND_DOCUMENTATION.md` - Frontend guide

2. **Explore the Code**:
   - Start with `frontend/src/components/OnboardingForm.jsx`
   - Review `backend/routes/` for API logic
   - Check `backend/models/` for data structures

3. **Customize for Your Needs**:
   - Add your own scrap item categories
   - Modify validation rules
   - Customize the UI/UX

## Support

If you encounter issues:

1. Check the browser console for errors
2. Review server logs in terminal
3. Verify environment variables
4. Test API endpoints with Postman
5. Check Clerk dashboard for webhook events

## Development Commands

```bash
# Backend commands
cd backend
npm run dev          # Start development server
npm start           # Start production server
node fix-indexes.js # Create database indexes

# Frontend commands  
cd frontend
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
```

---

**Setup Time**: ~10 minutes  
**Difficulty**: Beginner to Intermediate  
**Support**: Check documentation files for detailed guides
