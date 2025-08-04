"use client";
import React, { useState, useEffect } from "react";
import { X, Wallet, Edit2, Save, AlertCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { ethers } from "ethers";

const WalletModal = ({ isOpen, onClose, userType = "user" }) => {
  const { user } = useUser();
  const [walletAddress, setWalletAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [balance, setBalance] = useState("0.00");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempAddress, setTempAddress] = useState("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Base network configuration and minimum balance requirement
  const baseProvider = new ethers.JsonRpcProvider("https://sepolia.base.org");
  const MINIMUM_ETH_BALANCE = 0.0015;
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [hasMinimumBalance, setHasMinimumBalance] = useState(false);
  const [connectedWalletAddress, setConnectedWalletAddress] = useState('');
  
  // Initialize manual disconnect state from localStorage
  const [manuallyDisconnected, setManuallyDisconnected] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('wallet-manually-disconnected') === 'true';
    }
    return false;
  });

  // Base network configuration
  const BASE_SEPOLIA_CHAIN_ID = "84532"; // Base mainnet chain ID (8453 in hex)

  useEffect(() => {
    if (isOpen && user) {
      loadWalletAddress();
      checkWalletConnection();
    }
  }, [isOpen, user, userType]);

  // Check if wallet is already connected
  const checkWalletConnection = async () => {
    try {
      // Don't auto-connect if user manually disconnected
      if (manuallyDisconnected) {
        return;
      }
      
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setIsWalletConnected(true);
          setConnectedAccount(`${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
          setConnectedWalletAddress(accounts[0]);
          // Check balance for connected account
          await checkETHBalance(accounts[0]);
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setIsWalletConnected(false);
    setConnectedAccount(null);
    setConnectedWalletAddress('');
    setTempAddress('');
    setManuallyDisconnected(true); // Mark as manually disconnected
    localStorage.setItem('wallet-manually-disconnected', 'true'); // Persist to localStorage
    // Allow editing again when wallet is disconnected
    if (!walletAddress) {
      setIsEditing(true);
    }
  };

  // Save connected wallet address automatically
  const saveConnectedWalletAddress = async (address) => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/users/wallet/${user.id}/${userType}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress: address
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log("Connected wallet address saved successfully");
      } else {
        console.error("Failed to save connected wallet address:", data.message);
      }
    } catch (error) {
      console.error("Error saving connected wallet address:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Function to switch to Base Sepolia
  const switchToBase = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
      });

      // Wait a bit for the switch to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      console.log(
        "Current chain ID:",
        chainId,
        "Expected:",
        BASE_SEPOLIA_CHAIN_ID
      );

      return chainId === BASE_SEPOLIA_CHAIN_ID;
    } catch (error) {
      console.log("Switch error:", error);
      if (error.code === 4902) {
        try {
          console.log("Adding Base Sepolia network...");
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: BASE_SEPOLIA_CHAIN_ID,
                chainName: "Base Sepolia",
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://sepolia.base.org"],
                blockExplorerUrls: ["https://sepolia.basescan.org"],
              },
            ],
          });

          // Wait a bit for the network to be added
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
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
      console.log("Connect wallet clicked");
      
      if (typeof window === 'undefined') {
        alert("Please make sure you're running this in a browser environment.");
        return;
      }
      
      if (!window.ethereum) {
        alert(
          "No wallet detected. Please install MetaMask or another Web3 wallet and refresh the page."
        );
        return;
      }

      console.log("Wallet detected, requesting accounts...");
      setIsLoading(true);

      // Request account access first
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      if (!accounts || accounts.length === 0) {
        alert("No accounts found. Please make sure your wallet is unlocked.");
        return;
      }
      
      const connectedAddress = accounts[0];
      console.log("Connected to account:", connectedAddress);

      // Switch to Base Sepolia network
      const switchSuccess = await switchToBase();
      if (!switchSuccess) {
        console.warn(
          "Could not automatically switch to Base Sepolia. Continuing anyway..."
        );
      }

      // Create provider and check network
      const walletProvider = new ethers.BrowserProvider(window.ethereum);
      const network = await walletProvider.getNetwork();

      console.log("Connected to network:", network.chainId.toString());

      // Allow connection even if not on Base Sepolia, but warn user
      if (network.chainId !== BigInt(84532)) {
        console.warn(
          `Not on Base Sepolia (84532), currently on: ${network.chainId.toString()}`
        );
        // Don't block the connection, just proceed
      }

      // Update connection states
      setIsWalletConnected(true);
      setConnectedAccount(
        `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`
      );
      setConnectedWalletAddress(connectedAddress);
      setManuallyDisconnected(false); // Clear manual disconnect flag
      localStorage.removeItem('wallet-manually-disconnected'); // Clear from localStorage

      console.log("Wallet connected successfully!");

      // Check ETH balance
      await checkETHBalance(connectedAddress);

      // Automatically save the connected wallet address
      setWalletAddress(connectedAddress);
      setTempAddress(connectedAddress);
      setIsEditing(false); // Don't allow editing when wallet is connected
      
      // Auto-save the connected address
      await saveConnectedWalletAddress(connectedAddress);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      
      // More specific error messages
      if (error.code === 4001) {
        alert("Connection rejected. Please approve the connection in your wallet.");
      } else if (error.code === -32002) {
        alert("Connection request already pending. Please check your wallet.");
      } else {
        alert(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
      }
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
        alert(
          `Insufficient balance. Minimum ${MINIMUM_ETH_BALANCE} ETH required on Base Sepolia. Current balance: ${formattedBalance} ETH`
        );
      }
    } catch (error) {
      console.error("Error fetching ETH balance:", error);
      setBalance("Error");
      setHasMinimumBalance(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWalletAddress = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/api/users/wallet/${user.id}/${userType}`
      );
      const data = await response.json();

      if (data.success && data.data && data.data.walletAddress) {
        setWalletAddress(data.data.walletAddress);
        setTempAddress(data.data.walletAddress);
        // Only check balance if wallet is not already connected (to avoid duplicate checks)
        if (!isWalletConnected) {
          await checkETHBalance(data.data.walletAddress);
        }
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error loading wallet address:", error);
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
      alert("Please enter a valid wallet address");
      return;
    }

    // Validate wallet address format (basic validation)
    if (tempAddress.length < 26 || tempAddress.length > 62) {
      alert("Please enter a valid wallet address");
      return;
    }

    if (!user) {
      alert("User not authenticated");
      return;
    }

    // Check balance before saving
    setIsLoading(true);
    try {
      const balance = await baseProvider.getBalance(tempAddress.trim());
      const formattedBalance = ethers.formatEther(balance);
      const balanceNumber = parseFloat(formattedBalance);

      console.log(
        `Balance check: ${formattedBalance} ETH, Minimum required: ${MINIMUM_ETH_BALANCE} ETH`
      );

      // Update balance state
      setBalance(formattedBalance);
      setHasMinimumBalance(balanceNumber >= MINIMUM_ETH_BALANCE);

      if (balanceNumber < MINIMUM_ETH_BALANCE) {
        // Show alert warning for insufficient balance
        alert(
          `Insufficient balance. Minimum ${MINIMUM_ETH_BALANCE} ETH required on Base Sepolia. Current balance: ${formattedBalance} ETH`
        );
      }
    } catch (error) {
      console.error("Error checking balance:", error);
      // Don't block saving due to balance check error
      setBalance("Error checking balance");
    }
    setIsLoading(false);

    setIsSaving(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/api/users/wallet/${user.id}/${userType}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress: tempAddress.trim(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setWalletAddress(tempAddress);
        setIsEditing(false);
        fetchBalance(tempAddress);
        alert("Wallet address saved successfully!");
      } else {
        alert(data.message || "Failed to save wallet address");
      }
    } catch (error) {
      console.error("Error saving wallet address:", error);
      alert("Failed to save wallet address. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    // Don't allow editing if wallet is connected
    if (isWalletConnected) {
      return;
    }
    setTempAddress(walletAddress);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempAddress(walletAddress);
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-md w-full p-6 relative'>
        {/* Header */}
        <div className='flex justify-between items-center mb-6'>
          <div className='flex items-center'>
            <Wallet className='w-6 h-6 text-[#8BC34A] mr-2' />
            <h2 className='text-xl font-bold text-gray-900 font-geist'>
              Wallet Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
          >
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Wallet Connection Status */}
        <div className='mb-4'>
          <div
            className={`flex items-center p-3 rounded-lg ${
              isWalletConnected
                ? "bg-green-50 text-green-700"
                : "bg-yellow-50 text-yellow-700"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                isWalletConnected ? "bg-green-500" : "bg-yellow-500"
              }`}
            ></div>
            <span className='text-sm font-medium'>
              {isWalletConnected ? "Wallet Connected" : "Wallet Not Connected"}
            </span>
          </div>
        </div>

        {/* Connect Wallet Button */}
        {(!connectedAccount || !isWalletConnected) && (
          <div className='mb-6'>
            <button
              onClick={connectAndCheckBalance}
              disabled={isLoading}
              className='w-full flex items-center justify-center px-4 py-3 bg-[#8BC34A] text-white rounded-lg hover:bg-[#7CB342] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className='w-4 h-4 mr-2' />
                  Connect Web3 Wallet
                </>
              )}
            </button>
            {typeof window !== 'undefined' && !window.ethereum && (
              <p className='mt-2 text-sm text-red-600'>
                No Web3 wallet detected. Please install MetaMask or another Web3
                wallet.
              </p>
            )}
          </div>
        )}

        {/* Connected Account Display */}
        {connectedAccount && (
          <div className='mb-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
            <div className='flex justify-between items-center'>
              <div className='text-sm text-green-700'>
                <strong>Connected:</strong> {connectedAccount}
              </div>
              <button
                onClick={disconnectWallet}
                className='text-xs text-red-600 hover:text-red-800 underline'
              >
                Disconnect
              </button>
            </div>
          </div>
        )}

        {/* Wallet Address Section */}
        <div className='mb-6'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Wallet Address
          </label>
          {isEditing ? (
            <div className='space-y-3'>
              <input
                type='text'
                value={tempAddress}
                onChange={(e) => setTempAddress(e.target.value)}
                placeholder='Enter your wallet address (MetaMask, Coinbase, Trust, etc.)'
                className='w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent font-mono text-sm text-black placeholder:text-gray-600 placeholder:font-semibold'
              />
              <div className='flex gap-2'>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className='flex items-center px-4 py-2 bg-[#8BC34A] text-white rounded-lg hover:bg-[#7CB342] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isSaving ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className='w-4 h-4 mr-2' />
                      Save
                    </>
                  )}
                </button>
                {connectedWalletAddress && (
                  <button
                    onClick={() => setTempAddress(connectedWalletAddress)}
                    className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm'
                  >
                    Use Connected
                  </button>
                )}
                {walletAddress && (
                  <button
                    onClick={handleCancel}
                    className='px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium'
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className='space-y-3'>
              <div className='p-3 bg-gray-100 rounded-lg border border-gray-400 relative'>
                <div className='font-mono text-sm text-black break-all pr-20'>
                  {connectedWalletAddress || walletAddress || "No wallet address set"}
                </div>
                {isWalletConnected && (
                  <span className="absolute top-2 right-2 text-xs text-green-600 font-medium bg-green-100 border border-green-200 px-2 py-1 rounded-md shadow-sm">
                    Connected
                  </span>
                )}
              </div>
              {!isWalletConnected && (
                <button
                  onClick={handleEdit}
                  className='flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium'
                >
                  <Edit2 className='w-4 h-4 mr-2' />
                  Edit Address
                </button>
              )}
            </div>
          )}
        </div>

        {/* Balance Section */}
        <div className='mb-6'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            ETH Balance (Base Sepolia)
          </label>
          <div
            className={`p-4 rounded-lg text-white ${
              hasMinimumBalance
                ? "bg-gradient-to-r from-[#8BC34A] to-[#7CB342]"
                : "bg-gradient-to-r from-red-500 to-red-600"
            }`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm opacity-90'>
                  {hasMinimumBalance
                    ? "Sufficient Balance"
                    : `Minimum Required: ${MINIMUM_ETH_BALANCE} ETH`}
                </div>
                <div className='text-2xl font-bold'>
                  {isLoading ? (
                    <div className='flex items-center'>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                      Loading...
                    </div>
                  ) : (
                    `${balance} ETH`
                  )}
                </div>
              </div>
              <Wallet className='w-8 h-8 opacity-70' />
            </div>
          </div>
        </div>

        {/* Balance Warning */}
        {!hasMinimumBalance && balance !== "0.00" && balance !== "Error" && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <div className='flex items-start'>
              <AlertCircle className='w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0' />
              <div className='text-sm text-red-700'>
                <p className='font-medium mb-1'>Insufficient Balance!</p>
                <p>
                  You need at least {MINIMUM_ETH_BALANCE} ETH on Base Sepolia to
                  use this wallet.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Message */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
          <div className='flex items-start'>
            <AlertCircle className='w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0' />
            <div className='text-sm text-blue-700'>
              <p className='font-medium mb-1'>Base Sepolia Integration:</p>
              <ul className='list-disc list-inside space-y-1 text-xs'>
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
          className='w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium'
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default WalletModal;
