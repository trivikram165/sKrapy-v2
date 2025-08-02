const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');

// Middleware to capture raw body for webhook signature verification
const rawBodyMiddleware = express.raw({ type: 'application/json' });

// Verify Clerk webhook signature
function verifyWebhookSignature(body, signature, secret) {
  if (!signature || !secret) return false;
  
  try {
    const [timestamp, v1] = signature.split(',').map(part => part.split('=')[1]);
    const payloadString = `${timestamp}.${body}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadString, 'utf8')
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(v1, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Clerk webhook endpoint for user events
router.post('/clerk', async (req, res) => {
  try {
    // In development, we'll work with the parsed JSON body
    // In production, you'd need raw body for signature verification
    const { type, data } = req.body;
    
    console.log('Clerk webhook received:', type, 'for user:', data?.id);

    // Verify webhook signature in production
    if (process.env.NODE_ENV === 'production') {
      const signature = req.headers['svix-signature'];
      const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        console.error('CLERK_WEBHOOK_SECRET not configured');
        return res.status(500).json({ error: 'Webhook secret not configured' });
      }
      
      // For production, you'd implement proper signature verification here
      console.log('Production mode: webhook signature verification needed');
    }

    switch (type) {
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
      case 'user.created':
        console.log('User created in Clerk:', data.id);
        // We handle user creation through the signup flow, not here
        break;
      default:
        console.log('Unhandled webhook type:', type);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook handler failed', details: error.message });
  }
});

async function handleUserDeleted(userData) {
  try {
    const clerkId = userData.id;
    console.log('Processing user deletion for clerkId:', clerkId);

    // Delete ALL profiles for this user (both user and vendor)
    const deletedUsers = await User.deleteMany({ clerkId });
    
    console.log(`Deleted ${deletedUsers.deletedCount} profile(s) for user ${clerkId}`);
    
    if (deletedUsers.deletedCount > 0) {
      console.log('Successfully cleaned up user data from database');
      
      // Log which profiles were deleted for audit purposes
      console.log(`Data cleanup completed for clerkId: ${clerkId}`);
    } else {
      console.log('No user profiles found to delete (user may not have completed onboarding)');
    }
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
}

module.exports = router;
