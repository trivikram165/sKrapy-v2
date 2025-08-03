const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('../config/database');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', require('../routes/users'));
app.use('/api/orders', require('../routes/orders'));
app.use('/api/scrap-items', require('../routes/scrapItems'));
app.use('/api/onboarding', require('../routes/onboarding'));
app.use('/api/webhooks', require('../routes/webhooks'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'sKrapy API is running on Vercel!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to sKrapy API',
    version: '1.0.0',
    platform: 'Vercel',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      orders: '/api/orders',
      scrapItems: '/api/scrap-items',
      onboarding: '/api/onboarding'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Export the Express API
module.exports = app;
