# Crypto Payment Testing Documentation

## Overview
This document outlines the crypto payment functionality implemented in sKrapy-v2, including wallet connection management, order cancellation features, and testing procedures.

## Features Implemented

### 1. Wallet Connection Management
- **Auto-connection Detection**: Automatically detects connected MetaMask wallets
- **Manual Disconnect**: Users can disconnect wallets with persistent state
- **Manual Reconnection**: Explicit reconnection via "Connect Wallet" button
- **Cross-session Memory**: Disconnect preference persists across browser sessions

### 2. Wallet Address Management
- **Connected Address Priority**: Shows connected wallet address over manually entered ones
- **Non-editable Connected Address**: Prevents editing when wallet is connected
- **Manual Entry Fallback**: Allows manual input when no wallet is connected
- **Auto-save Functionality**: Automatically saves connected wallet addresses

### 3. Order Cancellation System
- **User Cancellation**: Users can cancel orders before payment
- **Vendor Filtering**: Vendors can filter "Cancelled by User" orders
- **Status Management**: Proper order status transitions and validation
- **Cancellation Tracking**: Records cancellation details (who, when, why)

### 4. Balance Validation
- **Minimum Balance Check**: Requires 0.0015 ETH on Base Sepolia
- **Real-time Validation**: Checks balance on wallet connection/address entry
- **Visual Warnings**: Shows insufficient balance alerts and UI indicators
- **Cross-user Consistency**: Same validation for both users and vendors

## Technical Implementation

### Backend Changes

#### Order Model (`/backend/models/Order.js`)
```javascript
// New status enum value
status: {
  enum: ['pending', 'accepted', 'in_progress', 'payment_pending', 'completed', 'cancelled', 'cancelled_by_user']
}

// New cancellation fields
cancelledBy: String // 'user' or 'vendor'
cancelledAt: Date
cancellationReason: String

// New method
cancelByUser(reason = null)
```

#### API Routes (`/backend/routes/orders.js`)
```javascript
// New endpoint
PUT /api/orders/:orderId/cancel

// Enhanced vendor orders endpoint
GET /api/orders/vendor/:vendorId - includes cancelled orders
```

### Frontend Changes

#### Wallet Modal (`/frontend/src/components/WalletModal.jsx`)
- **State Management**: Persistent disconnect state via localStorage
- **Connection Logic**: Conditional auto-connection based on user intent
- **Balance Checking**: Unified balance validation across all entry methods
- **Address Priority**: Connected wallet address takes precedence

#### User Orders (`/frontend/src/app/dashboard/user/orders/page.jsx`)
- **Cancellation UI**: Cancel button with status validation
- **Status Display**: Real-time order status updates

#### Vendor Orders (`/frontend/src/app/dashboard/vendor/orders/page.jsx`)
- **Filter Enhancement**: "Cancelled by User" filter tab
- **Status Mapping**: Proper display of cancelled order statuses

## Network Configuration

### Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Minimum Balance**: 0.0015 ETH
- **Network Switch**: Automatic network switching implemented

## Testing Procedures

### 1. Wallet Connection Testing
```bash
# Test Scenarios:
1. Fresh browser -> Should not auto-connect
2. Connect wallet -> Should auto-connect on refresh
3. Disconnect wallet -> Should stay disconnected on refresh
4. Reconnect manually -> Should enable auto-connection again
```

### 2. Address Management Testing
```bash
# Test Scenarios:
1. Connect MetaMask -> Address should auto-populate and be non-editable
2. Disconnect -> Address field should become editable
3. Manual entry -> Should allow typing when no wallet connected
4. Address priority -> Connected address should override manual entry
```

### 3. Order Cancellation Testing
```bash
# User Testing:
1. Create order -> Should allow cancellation
2. Order accepted -> Should allow cancellation
3. Payment pending -> Should prevent cancellation
4. Already paid -> Should prevent cancellation

# Vendor Testing:
1. View all orders -> Should see "Cancelled by User" filter
2. Filter cancelled -> Should show only user-cancelled orders
3. Order status -> Should display "cancelled by user" correctly
```

## v2.1 Payment Flow Changes

- Balance check removed from payment modal for faster UX
- Payment modal now only validates wallet addresses and order status
- When vendor clicks 'Start', customer wallet address is refreshed automatically
- Error handling improved for payment failures and missing wallet addresses

## Error Handling

### Wallet Connection Errors
- **No wallet detected**: Clear error message with installation instructions
- **Connection rejected**: User-friendly rejection handling
- **Network errors**: Graceful fallback with retry options

### Balance Check Errors
- **Network unavailable**: Shows "Error" status with retry capability
- **Invalid address**: Validation prevents invalid address entry
- **RPC failures**: Fallback behavior with user notification

### Order Cancellation Errors
- **Invalid order state**: Prevents cancellation of paid/completed orders
- **Authorization errors**: Ensures users can only cancel their own orders
- **Network errors**: Retry mechanism with user feedback

## Security Considerations

### Wallet Security
- **No private key storage**: Only uses public addresses and connection state
- **User-controlled permissions**: Respects MetaMask permission model
- **Session isolation**: Disconnect state is user-specific

### Order Security
- **User authorization**: Cancellation restricted to order owners
- **Status validation**: Prevents invalid status transitions
- **Audit trail**: Records all cancellation events with timestamps

## Deployment Notes

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001  # Backend API URL
```

### Dependencies
- **ethers.js**: Web3 provider and utilities
- **@clerk/nextjs**: User authentication
- **mongoose**: MongoDB ODM for order management

## Troubleshooting

### Common Issues
1. **Wallet not connecting**: Check MetaMask installation and permissions
2. **Balance not loading**: Verify Base Sepolia RPC connectivity
3. **Disconnect not working**: Clear localStorage and refresh
4. **Orders not updating**: Check backend server status

### Debug Commands
```bash
# Check localStorage
localStorage.getItem('wallet-manually-disconnected')

# Clear disconnect state
localStorage.removeItem('wallet-manually-disconnected')

# Check MetaMask connection
window.ethereum.request({ method: 'eth_accounts' })
```

## Future Enhancements

### Planned Features
- [ ] Multi-wallet support (Coinbase, WalletConnect)
- [ ] Gas estimation for transactions
- [ ] Transaction history tracking
- [ ] Advanced cancellation reasons
- [ ] Bulk order operations

### Performance Optimizations
- [ ] Balance caching with smart refresh
- [ ] Optimistic UI updates
- [ ] Connection state persistence
- [ ] Error recovery mechanisms

---

**Last Updated**: August 4, 2025  
**Version**: 2.0 (05-payment branch)  
**Author**: Development Team
