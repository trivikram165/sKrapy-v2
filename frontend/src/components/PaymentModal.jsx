'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { X, Wallet, AlertCircle, DollarSign, CheckCircle2, CreditCard } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { ethers } from 'ethers';
import SkrapContractArtifact from '../app/abi/SkrapContractABI.json';

const CONTRACT_ADDRESS = '0x7238567BFEbFD3837cFb8c4fA07AA61E04910061';
const contractABI = SkrapContractArtifact.abi;

const TOKEN_ADDRESSES = {
  usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  usdc: '0x036cbd53842c5426634e7929541ec2318f3dcf7e'
};

// Base Sepolia configuration
const BASE_SEPOLIA_CHAIN_ID = "0x14a34"; // 84532 in hex

const PaymentModal = ({ isOpen, onClose, order, vendorWalletAddress }) => {
  const { user } = useUser();
  const [selectedCurrency, setSelectedCurrency] = useState('eth');
  const [vendorAddress, setVendorAddress] = useState(vendorWalletAddress || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const [errors, setErrors] = useState({});
  
  // New states for crypto conversion and success modal
  const [cryptoAmount, setCryptoAmount] = useState('0.000000');
  const [exchangeRates, setExchangeRates] = useState({
    eth: 200000, // 1 ETH = 200,000 INR (example rates)
    usdt: 83,    // 1 USDT = 83 INR
    usdc: 83     // 1 USDC = 83 INR
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);

  const currencies = [
    { 
      id: 'eth', 
      name: 'Ethereum', 
      symbol: 'ETH', 
      icon: '⟠',
      color: 'bg-blue-500'
    },
    { 
      id: 'usdt', 
      name: 'Tether', 
      symbol: 'USDT', 
      icon: '₮',
      color: 'bg-green-500'
    },
    { 
      id: 'usdc', 
      name: 'USD Coin', 
      symbol: 'USDC', 
      icon: '$',
      color: 'bg-purple-500'
    }
  ];

  // Fetch exchange rates (you can replace with real API)
  const fetchExchangeRates = async () => {
    try {
      // Mock rates - replace with real API like CoinGecko
      const rates = {
        eth: 200000, // 1 ETH = 200,000 INR
        usdt: 83,    // 1 USDT = 83 INR
        usdc: 83     // 1 USDC = 83 INR
      };
      setExchangeRates(rates);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };

  // Calculate crypto amount based on INR and selected currency
  const calculateCryptoAmount = () => {
    if (!order?.totalAmount || !exchangeRates[selectedCurrency]) return;
    
    const inrAmount = parseFloat(order.totalAmount);
    const rate = exchangeRates[selectedCurrency];
    const cryptoValue = inrAmount / rate;
    setCryptoAmount(cryptoValue.toFixed(6));
  };

  // Switch to Base Sepolia network
  const switchToBaseSepolia = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
      });
      return true;
    } catch (error) {
      if (error.code === 4902) {
        // Network not added, add it
        try {
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
          return true;
        } catch (addError) {
          console.error("Error adding Base Sepolia network:", addError);
          return false;
        }
      }
      console.error("Error switching to Base Sepolia:", error);
      return false;
    }
  };

  const saveWalletAddress = useCallback(async (address) => {
    if (!user || !address.trim()) return;
    setIsSavingWallet(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://skrapy-backend.onrender.com'}/api/users/wallet/${user.id}/vendor`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address })
      });
    } catch (error) {
      console.error('Error saving wallet address:', error);
    } finally {
      setIsSavingWallet(false);
    }
  }, [user]);

  // Effects
  useEffect(() => {
    if (isOpen) {
      fetchExchangeRates();
    }
  }, [isOpen]);

  useEffect(() => {
    calculateCryptoAmount();
  }, [order?.totalAmount, selectedCurrency, exchangeRates]);

  useEffect(() => {
    if (!vendorAddress.trim()) return;
    const timeoutId = setTimeout(() => {
      saveWalletAddress(vendorAddress);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [vendorAddress, saveWalletAddress]);

  useEffect(() => {
    if (isOpen && order) {
      setVendorAddress(vendorWalletAddress || '');
    }
  }, [isOpen, order, vendorWalletAddress]);

  const validateForm = () => {
    const newErrors = {};
    if (!vendorAddress.trim()) {
      newErrors.vendorAddress = 'Vendor wallet address is required';
    } else if (vendorAddress.length < 26 || vendorAddress.length > 62) {
      newErrors.vendorAddress = 'Invalid wallet address format';
    }
    if (!order?.userWalletAddress) {
      newErrors.customerWallet = 'Customer wallet address is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    if (!window.ethereum) {
      alert('MetaMask not found. Please install MetaMask to proceed.');
      return;
    }

    setIsProcessing(true);
    try {
      // Switch to Base Sepolia network
      const networkSwitched = await switchToBaseSepolia();
      if (!networkSwitched) {
        throw new Error('Please switch to Base Sepolia network to proceed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
      
      const customerWallet = order.userWalletAddress;
      if (!ethers.isAddress(customerWallet)) {
        throw new Error('Invalid customer wallet address');
      }

      let tx;
      if (selectedCurrency === 'eth') {
        // Send ETH payment
        const ethAmount = ethers.parseEther(cryptoAmount);
        tx = await contract.sendNative(customerWallet, { value: ethAmount });
      } else {
        // Send ERC20 token payment
        const tokenAddress = TOKEN_ADDRESSES[selectedCurrency];
        if (!ethers.isAddress(tokenAddress)) {
          throw new Error('Invalid token address');
        }

        // First approve the token transfer
        const tokenContract = new ethers.Contract(tokenAddress, [
          'function approve(address spender, uint256 amount) returns (bool)',
          'function allowance(address owner, address spender) view returns (uint256)'
        ], signer);

        const tokenAmount = ethers.parseUnits(cryptoAmount, 18);
        
        // Check current allowance
        const currentAllowance = await tokenContract.allowance(await signer.getAddress(), CONTRACT_ADDRESS);
        if (currentAllowance < tokenAmount) {
          const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, tokenAmount);
          await approveTx.wait();
        }

        // Transfer tokens
        tx = await contract.sendERC20(tokenAddress, customerWallet, tokenAmount);
      }

      const receipt = await tx.wait();
      
      // Set payment details for success modal
      setPaymentDetails({
        inrAmount: order.totalAmount,
        cryptoAmount: cryptoAmount,
        currency: selectedCurrency.toUpperCase(),
        transactionHash: receipt.hash,
        recipient: customerWallet
      });
      setTransactionHash(receipt.hash);
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed: ' + (error.message || 'Unknown error occurred'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setPaymentDetails(null);
    setTransactionHash('');
    onClose();
  };

  if (!isOpen || !order) return null;

  // Success Modal
  if (showSuccessModal && paymentDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
          <div className="text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            
            {/* Success Message */}
            <h2 className="text-2xl font-bold text-gray-900 font-geist mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your payment has been processed successfully and sent to the customer.
            </p>
            
            {/* Payment Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold">₹{paymentDetails.inrAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Crypto Amount:</span>
                <span className="font-semibold">{paymentDetails.cryptoAmount} {paymentDetails.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-semibold">{paymentDetails.currency}</span>
              </div>
              <div className="border-t pt-2">
                <p className="text-xs text-gray-500 mb-1">Transaction Hash:</p>
                <p className="font-mono text-xs text-gray-800 break-all">{paymentDetails.transactionHash}</p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleCloseSuccessModal}
              className="w-full py-3 bg-[#8BC34A] text-white rounded-lg hover:bg-[#7CB342] transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Payment Modal JSX
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Wallet className="w-6 h-6 text-[#8BC34A] mr-2" />
            <h2 className="text-xl font-bold text-gray-900 font-geist">
              Process Payment
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Payment Amount Display */}
        <div className="bg-gradient-to-r from-[#8BC34A] to-[#7CB342] rounded-lg p-4 mb-6">
          <div className="text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Order Amount</span>
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold">₹{order.totalAmount}</div>
            <div className="text-sm opacity-90">
              ≈ {cryptoAmount} {selectedCurrency.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Crypto Currency Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-800 mb-3">
            Select Payment Method
          </label>
          <div className="grid grid-cols-3 gap-3">
            {currencies.map((currency) => (
              <button
                key={currency.id}
                onClick={() => setSelectedCurrency(currency.id)}
                disabled={isProcessing}
                className={`p-4 border-2 rounded-lg transition-all text-center ${
                  selectedCurrency === currency.id
                    ? 'border-[#8BC34A] bg-[#8BC34A] text-white'
                    : 'border-gray-300 hover:border-gray-400 bg-white text-gray-900'
                } disabled:opacity-50`}
              >
                <div className="text-2xl mb-1">{currency.icon}</div>
                <div className="text-xs font-medium">{currency.symbol}</div>
                <div className="text-xs opacity-75">
                  {(parseFloat(order.totalAmount) / exchangeRates[currency.id]).toFixed(6)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Conversion Rate Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Exchange Rate:</p>
              <p>1 {selectedCurrency.toUpperCase()} = ₹{exchangeRates[selectedCurrency]?.toLocaleString()}</p>
              <p className="text-xs mt-1 opacity-75">Rates updated in real-time</p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Order Number:</span>
              <span className="font-medium text-gray-900">#{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Total Items:</span>
              <span className="font-medium text-gray-900">{order.totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Original Amount:</span>
              <span className="font-bold text-[#8BC34A]">₹{order.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Crypto Amount:</span>
              <span className="font-bold text-purple-600">{cryptoAmount} {selectedCurrency.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Customer Wallet Address */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Customer Wallet Address
          </label>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
            <div className="font-mono text-sm text-gray-900 break-all">
              {order.userWalletAddress || 'Not provided by customer'}
            </div>
          </div>
          {!order.userWalletAddress && (
            <p className="text-xs text-yellow-600 mt-1">
              ⚠️ Customer hasn't linked their wallet address
            </p>
          )}
        </div>

        {/* Vendor Wallet Address */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Your Wallet Address
            {isSavingWallet && (
              <span className="ml-2 text-xs text-blue-600">
                Saving...
              </span>
            )}
          </label>
          <textarea
            value={vendorAddress}
            onChange={(e) => setVendorAddress(e.target.value)}
            placeholder="Enter your wallet address"
            rows={3}
            disabled={isProcessing}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent font-mono text-sm resize-none text-gray-900 placeholder:text-gray-500 placeholder:font-normal disabled:opacity-50 ${
              errors.vendorAddress ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.vendorAddress && (
            <p className="text-red-600 text-xs mt-1">{errors.vendorAddress}</p>
          )}
          <p className="text-xs text-gray-600 mt-1">
            Payment will be sent from this address {vendorAddress && !isSavingWallet && '• Auto-saved'}
          </p>
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Payment Information:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Payment will be processed on Base Sepolia network</li>
                <li>Transaction fees may apply based on network congestion</li>
                <li>Payment confirmation typically takes 1-5 minutes</li>
                <li>Ensure all details are correct before proceeding</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing || !order.userWalletAddress || !vendorAddress.trim()}
            className="flex-1 bg-[#8BC34A] text-white py-3 px-4 rounded-lg hover:bg-[#7CB342] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2 inline" />
                Pay {cryptoAmount} {selectedCurrency.toUpperCase()}
              </>
            )}
          </button>
        </div>

        {(!order.userWalletAddress || !vendorAddress.trim()) && (
          <p className="text-center text-xs text-red-600 mt-2">
            {!order.userWalletAddress && 'Customer wallet address required. '}
            {!vendorAddress.trim() && 'Your wallet address required.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
