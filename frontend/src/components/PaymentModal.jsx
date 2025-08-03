'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { X, Wallet, AlertCircle, Check } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

const PaymentModal = ({ isOpen, onClose, order, vendorWalletAddress }) => {
  const { user } = useUser();
  const [confirmAmount, setConfirmAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('eth');
  const [vendorAddress, setVendorAddress] = useState(vendorWalletAddress || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const [errors, setErrors] = useState({});

  const currencies = [
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: '⟠' },
    { id: 'usdt', name: 'Tether', symbol: 'USDT', icon: '₮' },
    { id: 'usdc', name: 'USD Coin', symbol: 'USDC', icon: '$' }
  ];

  // Auto-save vendor wallet address with debouncing
  const saveWalletAddress = useCallback(async (address) => {
    if (!user || !address.trim()) return;

    setIsSavingWallet(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://skrapy-backend.onrender.com'}/api/users/wallet/${user.id}/vendor`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (!response.ok) {
        throw new Error('Failed to save wallet address');
      }

      console.log('Vendor wallet address auto-saved successfully');
    } catch (error) {
      console.error('Error saving wallet address:', error);
    } finally {
      setIsSavingWallet(false);
    }
  }, [user]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!vendorAddress.trim()) return;
    
    const timeoutId = setTimeout(() => {
      saveWalletAddress(vendorAddress);
    }, 1000); // Save after 1 second of no typing

    return () => clearTimeout(timeoutId);
  }, [vendorAddress, saveWalletAddress]);

  useEffect(() => {
    if (isOpen && order) {
      setConfirmAmount(order.totalAmount?.toString() || '');
      // Use userWalletAddress from the order data fetched from database
      setVendorAddress(vendorWalletAddress || '');
    }
  }, [isOpen, order, vendorWalletAddress]);

  const validateForm = () => {
    const newErrors = {};

    if (!confirmAmount || parseFloat(confirmAmount) !== parseFloat(order?.totalAmount || 0)) {
      newErrors.amount = 'Confirm amount must match the order amount exactly';
    }

    if (!vendorAddress.trim()) {
      newErrors.vendorAddress = 'Vendor wallet address is required';
    } else if (vendorAddress.length < 26 || vendorAddress.length > 62) {
      newErrors.vendorAddress = 'Invalid wallet address format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Here you would integrate with your payment processing logic
      console.log('Processing payment:', {
        orderId: order._id,
        amount: confirmAmount,
        currency: selectedCurrency,
        fromAddress: vendorAddress,
        toAddress: order.userWalletAddress,
        orderNumber: order.orderNumber
      });

      alert('Payment processed successfully!');
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !order) return null;

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

        {/* Order Info */}
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
              <span className="text-gray-700">Order Amount:</span>
              <span className="font-bold text-[#8BC34A]">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* User Wallet Address */}
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

        {/* Confirm Amount */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Confirm Payment Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">₹</span>
            <input
              type="number"
              value={confirmAmount}
              onChange={(e) => setConfirmAmount(e.target.value)}
              placeholder="Enter amount to confirm"
              className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent text-gray-900 placeholder:text-gray-500 placeholder:font-normal ${
                errors.amount ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.amount && (
            <p className="text-red-600 text-xs mt-1">{errors.amount}</p>
          )}
          <p className="text-xs text-gray-600 mt-1">
            Must match the exact order amount: ₹{order.totalAmount}
          </p>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-800 mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-3">
            {currencies.map((currency) => (
              <button
                key={currency.id}
                onClick={() => setSelectedCurrency(currency.id)}
                className={`p-3 border-2 rounded-lg transition-all ${
                  selectedCurrency === currency.id
                    ? 'border-[#8BC34A] bg-[#8BC34A]'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                <div className={`text-2xl mb-1 ${
                  selectedCurrency === currency.id ? 'brightness-0 invert' : ''
                }`}>{currency.icon}</div>
                <div className={`text-xs font-medium ${
                  selectedCurrency === currency.id ? 'text-white' : 'text-black'
                }`}>{currency.symbol}</div>
              </button>
            ))}
          </div>
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
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent font-mono text-sm resize-none text-gray-900 placeholder:text-gray-500 placeholder:font-normal ${
              errors.vendorAddress ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.vendorAddress && (
            <p className="text-red-600 text-xs mt-1">{errors.vendorAddress}</p>
          )}
          <p className="text-xs text-gray-600 mt-1">
            This address will be used to send the payment {vendorAddress && !isSavingWallet && '• Auto-saved'}
          </p>
        </div>

        {/* Transaction Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Payment Information:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
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
            disabled={isProcessing || !order.userWalletAddress}
            className="flex-1 bg-[#8BC34A] text-white py-3 px-4 rounded-lg hover:bg-[#7CB342] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              `Pay ₹${order.totalAmount}`
            )}
          </button>
        </div>

        {!order.userWalletAddress && (
          <p className="text-center text-xs text-red-600 mt-2">
            Cannot process payment: Customer wallet address not available
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
