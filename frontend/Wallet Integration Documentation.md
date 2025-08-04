# Wallet Integration Documentation

## Overview
This document details the Web3 wallet integration implemented in sKrapy-v2, focusing on MetaMask connectivity, Base Sepolia network integration, and wallet address management.

## Table of Contents
1. [Wallet Features](#wallet-features)
2. [Technical Implementation](#technical-implementation)
3. [Network Configuration](#network-configuration)
4. [User Interface Components](#user-interface-components)
5. [State Management](#state-management)
6. [Error Handling](#error-handling)
7. [Security Considerations](#security-considerations)
8. [Testing Guidelines](#testing-guidelines)

---

## Wallet Features

### Core Functionality
- **MetaMask Integration**: Seamless connection to MetaMask browser extension
- **Auto-connection Detection**: Automatically detects existing wallet connections
- **Manual Disconnect**: Users can disconnect wallets with persistent state
- **Network Switching**: Automatic Base Sepolia network switching
- **Address Management**: Smart wallet address handling and storage

### User Experience Features
- **Connection Status Indicators**: Visual feedback for connection state
- **Non-editable Connected Addresses**: Prevents manual editing when wallet is connected
- **Persistent Disconnect State**: Remembers user's disconnect preference
- **Cross-session Memory**: Maintains connection state across browser sessions
- **Manual Entry Fallback**: Allows manual address input when wallet is unavailable

---

## Technical Implementation

### Dependencies
```json
{
  "ethers": "^6.x.x",
  "@clerk/nextjs": "^x.x.x"
}
```

### Component Structure
```
src/components/
└── WalletModal.jsx          # Main wallet interface component
```

### Core Functions

#### Connection Management
```javascript
// Connect to MetaMask wallet
const connectAndCheckBalance = async () => {
  // Request wallet connection
  // Switch to Base Sepolia network
  // Update connection states
  // Auto-save wallet address
}

// Disconnect wallet
const disconnectWallet = () => {
  // Clear connection state
  // Set manual disconnect flag
  // Persist disconnect preference
}

// Check if wallet is already connected
const checkWalletConnection = async () => {
  // Respect manual disconnect flag
  // Query MetaMask for accounts
  // Auto-connect if available and not manually disconnected
}
```

#### Network Management
```javascript
const switchToBase = async () => {
  // Attempt to switch to Base Sepolia (84532)
  // Add network if not present in MetaMask
  // Handle user rejection gracefully
}
```

---

## Network Configuration

### Base Sepolia Testnet
```javascript
const BASE_SEPOLIA_CONFIG = {
  chainId: '0x14a34',           // 84532 in hex
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org']
}
```

### RPC Configuration
```javascript
const baseProvider = new ethers.JsonRpcProvider("https://sepolia.base.org");
```

---

## User Interface Components

### Wallet Modal Structure
```jsx
<WalletModal isOpen={boolean} onClose={function} userType="user|vendor">
  {/* Connection Status Section */}
  {/* Wallet Address Display/Input */}
  {/* Connection/Disconnection Controls */}
  {/* Network Information */}
</WalletModal>
```

### Connection States
1. **Not Connected**: Shows manual input field and connect button
2. **Connected**: Shows connected address (non-editable) with disconnect option
3. **Manually Disconnected**: Shows manual input, prevents auto-connection
4. **Loading**: Shows spinner during connection checks

### Visual Indicators
- **Connected Badge**: Green indicator showing wallet connection status
- **Network Status**: Base Sepolia network confirmation
- **Loading States**: Spinners for async operations

---

## State Management

### React State Variables
```javascript
const [isWalletConnected, setIsWalletConnected] = useState(false);
const [connectedAccount, setConnectedAccount] = useState(null);
const [connectedWalletAddress, setConnectedWalletAddress] = useState('');
const [walletAddress, setWalletAddress] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [manuallyDisconnected, setManuallyDisconnected] = useState(() => {
  return localStorage.getItem('wallet-manually-disconnected') === 'true';
});
```

### Persistent Storage
```javascript
// Store manual disconnect preference
localStorage.setItem('wallet-manually-disconnected', 'true');

// Clear disconnect preference on manual reconnection
localStorage.removeItem('wallet-manually-disconnected');
```

### Address Priority Logic
```javascript
// Display priority: Connected > Saved > Fallback
const displayAddress = connectedWalletAddress || walletAddress || "No wallet address set";
```

---

## Error Handling

### Connection Errors
```javascript
// User rejection
if (error.code === 4001) {
  alert("Connection rejected. Please approve the connection in your wallet.");
}

// Already pending
if (error.code === -32002) {
  alert("Connection request already pending. Please check your wallet.");
}

// General errors
alert(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
```

### Network Errors
```javascript
// RPC errors
catch (error) {
  console.error("Error fetching ETH balance:", error);
}
```

### Validation Errors
```javascript
// Address validation
if (tempAddress.length < 26 || tempAddress.length > 62) {
  alert("Please enter a valid wallet address");
  return;
}
```

---

## Security Considerations

### Wallet Security
- **No Private Key Storage**: Only stores public wallet addresses
- **User-controlled Permissions**: Respects MetaMask permission model
- **Session Isolation**: Each user session is independent
- **Permission Requests**: Explicit user approval for all connections

### Data Privacy
- **Local Storage Only**: Disconnect preferences stored locally
- **No Cross-domain Sharing**: Wallet data isolated to application domain
- **Temporary State**: Connection state cleared on application closure

### Network Security
- **HTTPS Only**: All RPC calls over secure connections
- **Verified Networks**: Only connects to verified Base Sepolia endpoints
- **Input Validation**: All wallet addresses validated before processing

---

## Testing Guidelines

### Manual Testing Checklist

#### Connection Flow
- [ ] Fresh browser session should not auto-connect
- [ ] Connect button should trigger MetaMask connection
- [ ] Connected wallet should show address and "Connected" badge
- [ ] Disconnect button should clear connection state
- [ ] Page refresh should respect disconnect preference
- [ ] Manual reconnection should enable auto-connection

#### Address Management
- [ ] Connected address should be non-editable
- [ ] Disconnected state should allow manual entry
- [ ] Connected address should take priority over manual entry
- [ ] Address validation should prevent invalid inputs

#### Network Integration
- [ ] Should auto-switch to Base Sepolia
- [ ] Should handle network switch rejection gracefully
- [ ] Should display appropriate network warnings

### Automated Testing
```javascript
// Example test cases
describe('Wallet Integration', () => {
  test('should connect to MetaMask', async () => {
    // Mock MetaMask connection
    // Trigger connect function
    // Assert connection state
  });

  test('should respect manual disconnect', async () => {
    // Set manual disconnect flag
    // Trigger connection check
    // Assert no auto-connection
  });
});
```

### Browser Compatibility
- **Chrome**: Full MetaMask extension support
- **Firefox**: Full MetaMask extension support
- **Safari**: Limited Web3 wallet support
- **Mobile**: MetaMask mobile browser support

---

## Integration Examples

### Basic Usage
```jsx
import WalletModal from '../components/WalletModal';

function OrderPage() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsWalletModalOpen(true)}>
        Manage Wallet
      </button>
      
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
        userType="user"
      />
    </div>
  );
}
```

### Advanced Integration
```jsx
// Listen for wallet events
useEffect(() => {
  const handleWalletOpen = () => setIsWalletModalOpen(true);
  
  window.addEventListener('openWalletModal', handleWalletOpen);
  return () => window.removeEventListener('openWalletModal', handleWalletOpen);
}, []);
```

---

## Troubleshooting

### Common Issues

**Wallet Not Connecting**
- Ensure MetaMask extension is installed and unlocked
- Check if site permissions are granted in MetaMask
- Verify network connectivity

**Balance Not Loading**
- Check Base Sepolia RPC endpoint connectivity
- Verify wallet address format
- Ensure sufficient network connection

**Disconnect Not Working**
- Clear browser localStorage: `localStorage.removeItem('wallet-manually-disconnected')`
- Refresh page after clearing storage
- Check browser console for errors

**Network Switch Failing**
- Manually add Base Sepolia network to MetaMask
- Check MetaMask network settings
- Verify RPC URL accessibility

### Debug Commands
```javascript
// Check connection state
console.log('Connected:', window.ethereum?.selectedAddress);

// Check disconnect preference
console.log('Manual disconnect:', localStorage.getItem('wallet-manually-disconnected'));

// Test network connection
console.log('Network:', await window.ethereum?.request({ method: 'eth_chainId' }));
```

---

## v2.1 Updates

- Removed balance validation from payment modal
- Payment flow now only checks wallet address validity
- Network switching and error handling improved
- Documentation updated for new payment modal logic

---

**Last Updated**: August 4, 2025  
**Version**: 2.1 (05-payment branch)  
**Component**: WalletModal.jsx
