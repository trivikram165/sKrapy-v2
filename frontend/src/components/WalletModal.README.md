# WalletModal Component Documentation

## Overview
The WalletModal component provides a comprehensive interface for Web3 wallet management in sKrapy-v2, featuring MetaMask integration, Base Sepolia network support, and persistent connection state management.

## Props
```jsx
<WalletModal 
  isOpen={boolean}           // Controls modal visibility
  onClose={function}         // Callback when modal is closed
  userType="user|vendor"     // User type for API endpoints
/>
```

## Features

### 🔗 Wallet Connection Management
- **Auto-detection**: Automatically detects existing MetaMask connections
- **Manual Connection**: Explicit wallet connection via "Connect Wallet" button
- **Persistent Disconnect**: Remembers user's disconnect preference across sessions
- **Cross-session State**: Maintains connection state using localStorage

### 📍 Address Management
- **Priority Display**: Connected wallet address takes precedence over manual entry
- **Non-editable Connected**: Prevents editing when wallet is connected
- **Manual Entry Fallback**: Allows manual input when no wallet is connected
- **Auto-save**: Automatically saves connected wallet addresses to database

### 💰 Balance Validation
- **Real-time Checking**: Validates ETH balance on Base Sepolia network
- **Minimum Requirements**: Enforces 0.0015 ETH minimum balance
- **Visual Warnings**: Shows insufficient balance alerts and UI indicators
- **Error Handling**: Graceful handling of network and balance check errors

### 🌐 Network Integration
- **Base Sepolia**: Integrated with Base Sepolia testnet (Chain ID: 84532)
- **Auto-switching**: Automatically switches MetaMask to Base Sepolia
- **Network Validation**: Verifies connection to correct network
- **Fallback Handling**: Continues operation even if network switch fails

## State Management

### React State Variables
```javascript
const [isWalletConnected, setIsWalletConnected] = useState(false);
const [connectedAccount, setConnectedAccount] = useState(null);
const [connectedWalletAddress, setConnectedWalletAddress] = useState('');
const [walletAddress, setWalletAddress] = useState('');
const [balance, setBalance] = useState('0.00');
const [hasMinimumBalance, setHasMinimumBalance] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [isEditing, setIsEditing] = useState(false);
const [tempAddress, setTempAddress] = useState('');
const [manuallyDisconnected, setManuallyDisconnected] = useState(false);
```

### Persistent Storage
```javascript
// Disconnect preference stored in localStorage
localStorage.setItem('wallet-manually-disconnected', 'true');
localStorage.removeItem('wallet-manually-disconnected');
```

## Core Functions

### Connection Management
```javascript
// Connect to wallet and check balance
const connectAndCheckBalance = async () => {
  // Request MetaMask connection
  // Switch to Base Sepolia network
  // Update connection states
  // Check ETH balance
  // Auto-save wallet address
  // Clear manual disconnect flag
}

// Disconnect wallet with persistent state
const disconnectWallet = () => {
  // Clear all connection state
  // Set manual disconnect flag
  // Persist disconnect preference
  // Enable manual editing if no saved address
}

// Check existing wallet connection
const checkWalletConnection = async () => {
  // Respect manual disconnect preference
  // Query MetaMask for connected accounts
  // Auto-connect if available and not manually disconnected
  // Check balance for connected account
}
```

### Balance Validation
```javascript
// Check ETH balance on Base Sepolia
const checkETHBalance = async (address) => {
  // Connect to Base Sepolia RPC
  // Get wallet balance using ethers.js
  // Validate against minimum requirement (0.0015 ETH)
  // Show alert for insufficient balance
  // Update UI state
}
```

### Address Management
```javascript
// Load saved wallet address from database
const loadWalletAddress = async () => {
  // Fetch user's saved wallet address
  // Set address and temporary address state
  // Check balance only if wallet not connected (avoid duplicates)
  // Enable editing mode if no address found
}

// Save wallet address to database
const handleSave = async () => {
  // Validate address format
  // Check balance before saving
  // Make API call to save address
  // Update UI state
}
```

## API Integration

### Endpoints Used
```javascript
// Get user's wallet address
GET /api/users/wallet/${userId}/${userType}

// Save/update wallet address
PUT /api/users/wallet/${userId}/${userType}
Body: { walletAddress: string }
```

### Error Handling
```javascript
// Connection errors
if (error.code === 4001) {
  // User rejected connection
}
if (error.code === -32002) {
  // Connection already pending
}

// Network errors
catch (error) {
  // RPC connection failed
  // Display error state
}
```

## UI Components

### Connection Status Display
```jsx
{isWalletConnected && (
  <span className="text-xs text-green-600 font-medium bg-green-100 border border-green-200 px-2 py-1 rounded-md shadow-sm">
    Connected
  </span>
)}
```

### Balance Warning
```jsx
{!hasMinimumBalance && balance !== "0.00" && balance !== "Error" && (
  <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
    <div className='flex items-start'>
      <AlertCircle className='w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0' />
      <div className='text-sm text-red-700'>
        <p className='font-medium mb-1'>Insufficient Balance!</p>
        <p>You need at least {MINIMUM_ETH_BALANCE} ETH on Base Sepolia.</p>
      </div>
    </div>
  </div>
)}
```

### Address Input/Display
```jsx
{isEditing ? (
  <input
    type='text'
    value={tempAddress}
    onChange={(e) => setTempAddress(e.target.value)}
    placeholder='Enter your wallet address'
    className='w-full p-3 border border-gray-400 rounded-lg'
  />
) : (
  <div className='p-3 bg-gray-100 rounded-lg border relative'>
    <div className='font-mono text-sm text-black break-all pr-20'>
      {connectedWalletAddress || walletAddress || "No wallet address set"}
    </div>
    {isWalletConnected && (
      <span className="absolute top-2 right-2 text-xs text-green-600">
        Connected
      </span>
    )}
  </div>
)}
```

## Usage Examples

### Basic Implementation
```jsx
import WalletModal from './WalletModal';

function UserDashboard() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsWalletModalOpen(true)}>
        Manage Wallet
      </button>
      
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
        userType="user"
      />
    </>
  );
}
```

### Event-driven Opening
```jsx
// Listen for global wallet modal events
useEffect(() => {
  const handleOpenWallet = () => setIsWalletModalOpen(true);
  window.addEventListener('openWalletModal', handleOpenWallet);
  return () => window.removeEventListener('openWalletModal', handleOpenWallet);
}, []);

// Trigger from anywhere in the app
window.dispatchEvent(new Event('openWalletModal'));
```

## Configuration

### Network Settings
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
};
```

### Constants
```javascript
const MINIMUM_ETH_BALANCE = 0.0015;  // Minimum required balance
const BASE_SEPOLIA_CHAIN_ID = "84532"; // Network chain ID
```

## Testing

### Manual Test Cases
1. **Fresh Browser**: Should not auto-connect
2. **Connect Wallet**: Should trigger MetaMask and auto-connect on refresh
3. **Disconnect**: Should stay disconnected after page refresh
4. **Manual Reconnect**: Should enable auto-connection again
5. **Address Priority**: Connected address should override manual entry
6. **Balance Warning**: Should show for insufficient balance
7. **Network Switch**: Should auto-switch to Base Sepolia

### Debug Commands
```javascript
// Check localStorage
localStorage.getItem('wallet-manually-disconnected')

// Clear disconnect state
localStorage.removeItem('wallet-manually-disconnected')

// Check MetaMask connection
window.ethereum?.selectedAddress
```

## Dependencies
```json
{
  "ethers": "^6.x.x",
  "@clerk/nextjs": "^x.x.x",
  "lucide-react": "^x.x.x"
}
```

## Browser Compatibility
- ✅ Chrome with MetaMask extension
- ✅ Firefox with MetaMask extension
- ✅ Edge with MetaMask extension
- ⚠️ Safari (limited Web3 support)
- ✅ MetaMask Mobile Browser

---

**Last Updated**: August 4, 2025  
**Component Version**: 2.0 (05-payment branch)  
**File**: `/src/components/WalletModal.jsx`