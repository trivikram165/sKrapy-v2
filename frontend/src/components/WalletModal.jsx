'use client';
import React, { useState, useEffect } from 'react';
import { X, Wallet, Edit2, Save, AlertCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

const WalletModal = ({ isOpen, onClose, userType = 'user' }) => {
  const { user } = useUser();
  const [walletAddress, setWalletAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [balance, setBalance] = useState('0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempAddress, setTempAddress] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      loadWalletAddress();
    }
  }, [isOpen, user, userType]);

  const loadWalletAddress = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/wallet/${user.id}/${userType}`);
      const data = await response.json();
      
      if (data.success && data.data && data.data.walletAddress) {
        setWalletAddress(data.data.walletAddress);
        setTempAddress(data.data.walletAddress);
        fetchBalance(data.data.walletAddress);
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
    
    setIsLoading(true);
    try {
      // Simulate API call to fetch wallet balance
      // In real implementation, you would call your blockchain API here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock balance data
      const mockBalance = (Math.random() * 10).toFixed(4);
      setBalance(mockBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('Error');
    } finally {
      setIsLoading(false);
    }
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

    setIsSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/wallet/${user.id}/${userType}`, {
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
                  disabled={isSaving}
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
            Wallet Balance
          </label>
          <div className="p-4 bg-gradient-to-r from-[#8BC34A] to-[#7CB342] rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90">Total Balance</div>
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

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Wallet Integration Benefits:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Secure and transparent payments</li>
                <li>Fast transaction processing</li>
                <li>Real-time balance tracking</li>
                <li>Reduced payment disputes</li>
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
