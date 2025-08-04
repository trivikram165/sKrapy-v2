'use client';
import React, { useState, useEffect } from 'react';
import { X, Wallet, Edit2, Save, AlertCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { ethers } from 'ethers';

const WalletModal = ({ isOpen, onClose, userType = 'user' }) => {
  const { user } = useUser();
  const [walletAddress, setWalletAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [balance, setBalance] = useState('0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempAddress, setTempAddress] = useState('');

  // Base network configuration and minimum balance requirement
  const baseProvider = new ethers.JsonRpcProvider("https://sepolia.base.org");
  const MINIMUM_ETH_BALANCE = 0.0015;
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [hasMinimumBalance, setHasMinimumBalance] = useState(false);

  // Base network configuration
  const BASE_SEPOLIA_CHAIN_ID = "84532"; // Base mainnet chain ID (8453 in hex)

  useEffect(() => {
    if (isOpen && user) {
      loadWalletAddress();
    }
  }, [isOpen, user, userType]);

  // Function to switch to Base Sepolia
  const switchToBase = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
      });
      
      // Wait a bit for the switch to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      console.log("Current chain ID:", chainId, "Expected:", BASE_SEPOLIA_CHAIN_ID);
      
      return chainId === BASE_SEPOLIA_CHAIN_ID;
    } catch (error) {
      console.log("Switch error:", error);
      if (error.code === 4902) {
        try {
          console.log("Adding Base Sepolia network...");
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: BASE_SEPOLIA_CHAIN_ID,
              chainName: "Base Sepolia",
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://sepolia.base.org"],
              blockExplorerUrls: ["https://sepolia.basescan.org"],
            }],
          });
          
          // Wait a bit for the network to be added
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const chainId = await window.ethereum.request({ method: "eth_chainId" });
          console.log("Chain ID after adding:", chainId);
          
          return chainId === BASE_SEPOLIA_CHAIN_ID;
        } catch (addError) {
          console.error("Error adding Base Sepolia network:", addError);
          return false;
        }
      } else {
        console.error("Error switching to Base Sepolia:", error);
        return false;
      }
    }
  };

  // Function to connect wallet and check balance
  const connectAndCheckBalance = async () => {
    try {
      if (!window.ethereum) {
        alert("No wallet detected. Please install MetaMask or another Web3 wallet.");
        return;
      }

      setIsLoading(true);
      
      // Switch to Base Sepolia network
      const switchSuccess = await switchToBase();
      if (!switchSuccess) {
        // Don't stop the process, just warn the user
        console.warn("Could not automatically switch to Base Sepolia. Continuing anyway...");
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const connectedAddress = accounts[0];
      
      // Create provider and check network
      const walletProvider = new ethers.BrowserProvider(window.ethereum);
      const network = await walletProvider.getNetwork();
      
      console.log("Connected to network:", network.chainId.toString());
      
      // Allow connection even if not on Base Sepolia, but warn user
      if (network.chainId !== BigInt(84532)) {
        console.warn(`Not on Base Sepolia (84532), currently on: ${network.chainId.toString()}`);
        // Don't block the connection, just proceed
      }

      setConnectedAccount(`${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`);
      
      // Check ETH balance
      await checkETHBalance(connectedAddress);
      
      // Set the connected address as temp address for editing
      setTempAddress(connectedAddress);
      setIsEditing(true);
      
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check ETH balance on Base network
  const checkETHBalance = async (address) => {
    try {
      setIsLoading(true);
      
      // Get balance from Base network
      const balance = await baseProvider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);
      const balanceNumber = parseFloat(formattedBalance);
      
      setBalance(formattedBalance);
      setHasMinimumBalance(balanceNumber >= MINIMUM_ETH_BALANCE);
      
      if (balanceNumber < MINIMUM_ETH_BALANCE) {
        alert(`Insufficient balance. Minimum ${MINIMUM_ETH_BALANCE} ETH required on Base Sepolia. Current balance: ${formattedBalance} ETH`);
      }
      
    } catch (error) {
      console.error('Error fetching ETH balance:', error);
      setBalance('Error');
      setHasMinimumBalance(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWalletAddress = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://skrapy-backend.onrender.com'}/api/users/wallet/${user.id}/${userType}`);
      const data = await response.json();
      
      if (data.success && data.data && data.data.walletAddress) {
        setWalletAddress(data.data.walletAddress);
        setTempAddress(data.data.walletAddress);
        // Check balance for existing wallet address
        await checkETHBalance(data.data.walletAddress);
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error loading wallet address:', error);
      setIsEditing(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBalance = async (address) => {
    if (!address) return;
    await checkETHBalance(address);
  };

  const handleSave = async () => {
    if (!tempAddress.trim()) {
      alert('Please enter a valid wallet address');
      return;
    }

    // Validate wallet address format (basic validation)
    if (tempAddress.length < 26 || tempAddress.length > 62) {
      alert('Please enter a valid wallet address');
      return;
    }

    if (!user) {
      alert('User not authenticated');
      return;
    }

    // Check balance before saving
    setIsLoading(true);
    try {
      const balance = await baseProvider.getBalance(tempAddress.trim());
      const formattedBalance = ethers.formatEther(balance);
      const balanceNumber = parseFloat(formattedBalance);
      
      console.log(`Balance check: ${formattedBalance} ETH, Minimum required: ${MINIMUM_ETH_BALANCE} ETH`);
      
      // Update balance state
      setBalance(formattedBalance);
      setHasMinimumBalance(balanceNumber >= MINIMUM_ETH_BALANCE);
      
      if (balanceNumber < MINIMUM_ETH_BALANCE) {
        // Don't block saving, just warn
        console.warn(`Low balance: ${formattedBalance} ETH. Minimum recommended: ${MINIMUM_ETH_BALANCE} ETH`);
      }
    } catch (error) {
      console.error('Error checking balance:', error);
      // Don't block saving due to balance check error
      setBalance('Error checking balance');
    }
    setIsLoading(false);

    setIsSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://skrapy-backend.onrender.com'}/api/users/wallet/${user.id}/${userType}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: tempAddress.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setWalletAddress(tempAddress);
        setIsEditing(false);
        fetchBalance(tempAddress);
        alert('Wallet address saved successfully!');
      } else {
        alert(data.message || 'Failed to save wallet address');
      }
    } catch (error) {
      console.error('Error saving wallet address:', error);
      alert('Failed to save wallet address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setTempAddress(walletAddress);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempAddress(walletAddress);
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Wallet className="w-6 h-6 text-[#8BC34A] mr-2" />
            <h2 className="text-xl font-bold text-gray-900 font-geist">
              Wallet Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Connect Wallet Button */}
        {!connectedAccount && (
          <div className="mb-6">
            <button
              onClick={connectAndCheckBalance}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 bg-[#8BC34A] text-white rounded-lg hover:bg-[#7CB342] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </button>
          </div>
        )}

        {/* Connected Account Display */}
        {connectedAccount && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-green-700">
              <strong>Connected:</strong> {connectedAccount}
            </div>
          </div>
        )}

        {/* Wallet Address Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wallet Address
          </label>
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={tempAddress}
                onChange={(e) => setTempAddress(e.target.value)}
                placeholder="Enter your wallet address (MetaMask, Coinbase, Trust, etc.)"
                className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent font-mono text-sm text-black placeholder:text-gray-600 placeholder:font-semibold"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !hasMinimumBalance}
                  className="flex items-center px-4 py-2 bg-[#8BC34A] text-white rounded-lg hover:bg-[#7CB342] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </button>
                {walletAddress && (
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-gray-100 rounded-lg border border-gray-400">
                <div className="font-mono text-sm text-black break-all">
                  {walletAddress || 'No wallet address set'}
                </div>
              </div>
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Address
              </button>
            </div>
          )}
        </div>

        {/* Balance Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ETH Balance (Base Sepolia)
          </label>
          <div className={`p-4 rounded-lg text-white ${hasMinimumBalance ? 'bg-gradient-to-r from-[#8BC34A] to-[#7CB342]' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90">
                  {hasMinimumBalance ? 'Sufficient Balance' : `Minimum Required: ${MINIMUM_ETH_BALANCE} ETH`}
                </div>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    `${balance} ETH`
                  )}
                </div>
              </div>
              <Wallet className="w-8 h-8 opacity-70" />
            </div>
          </div>
        </div>

        {/* Balance Warning */}
        {!hasMinimumBalance && balance !== '0.00' && balance !== 'Error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p className="font-medium mb-1">Insufficient Balance!</p>
                <p>You need at least {MINIMUM_ETH_BALANCE} ETH on Base Sepolia to use this wallet.</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Base Sepolia Integration:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Requires minimum {MINIMUM_ETH_BALANCE} ETH balance</li>
                <li>Fast and low-cost transactions</li>
                <li>Real-time balance verification</li>
                <li>Secure wallet connection</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default WalletModal;