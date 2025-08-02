# Clerk Webhook Setup for User Deletion

This document explains how to set up Clerk webhooks to automatically delete user data from your database when a user deletes their Clerk account.

## Backend Implementation ✅

The webhook endpoint has been implemented at `/api/webhooks/clerk` and handles the following:

- **User deletion**: When a user deletes their Clerk account, all their profiles (user + vendor) are automatically deleted from the database
- **Security**: Includes signature verification for production environments
- **Logging**: Comprehensive logging for audit and debugging purposes

## Setting Up the Webhook in Clerk Dashboard

### 1. Access Clerk Dashboard
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Navigate to **Webhooks** in the sidebar

### 2. Create Webhook Endpoint
1. Click **"Add Endpoint"**
2. Enter your webhook URL:
   - **Development**: `http://localhost:3001/api/webhooks/clerk`
   - **Production**: `https://yourdomain.com/api/webhooks/clerk`

### 3. Configure Events
Select the following events to monitor:
- ✅ **user.deleted** (Required - handles account deletion)
- ⚪ **user.created** (Optional - currently logged but not processed)

### 4. Get Webhook Secret
1. After creating the endpoint, copy the **Signing Secret**
2. Add it to your `.env` file:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_your_secret_here
   ```

### 5. Test the Webhook
1. Use the Clerk dashboard **"Send Example"** feature
2. Send a `user.deleted` event
3. Check your server logs to confirm processing

## How It Works

### When a user deletes their Clerk account:

1. **Clerk sends webhook** → `POST /api/webhooks/clerk`
2. **Signature verification** (in production)
3. **Event processing**:
   ```javascript
   case 'user.deleted':
     // Deletes ALL profiles for the user (user + vendor roles)
     await User.deleteMany({ clerkId: userData.id });
   ```
4. **Database cleanup** → Both user and vendor profiles removed
5. **Audit logging** → Records deletion for compliance

### Example webhook payload:
```json
{
  "type": "user.deleted",
  "data": {
    "id": "user_2ABC123...",
    "deleted": true,
    // ... other user data
  }
}
```

## Security Features

- **Signature Verification**: Validates webhook authenticity in production
- **Environment Check**: Different handling for development vs production
- **Error Handling**: Graceful error handling with detailed logging
- **Audit Trail**: Logs all deletion actions for compliance

## Testing

You can test the webhook locally:

```bash
# Test user deletion
curl -X POST "http://localhost:3001/api/webhooks/clerk" \
  -H "Content-Type: application/json" \
  -d '{"type":"user.deleted","data":{"id":"test_user_123"}}'
```

## Production Deployment

### Environment Variables Required:
```env
CLERK_WEBHOOK_SECRET=whsec_your_actual_secret
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
```

### Webhook URL:
- Update the Clerk webhook endpoint URL to your production domain
- Ensure HTTPS is enabled for security

## Data Deletion Compliance

This implementation ensures:
- ✅ **Complete data removal** - All user profiles deleted
- ✅ **Role separation respected** - Both user and vendor profiles removed
- ✅ **Audit logging** - Actions recorded for compliance
- ✅ **Error handling** - Failed deletions are logged
- ✅ **Security** - Webhook signature verification in production

## Monitoring

Check your server logs for webhook activity:
```
Clerk webhook received: user.deleted for user: user_2ABC123...
Processing user deletion for clerkId: user_2ABC123...
Deleted 2 profile(s) for user user_2ABC123...
Successfully cleaned up user data from database
```

This ensures GDPR/CCPA compliance by automatically removing user data when they delete their account.
