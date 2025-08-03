'use client';
import React, { useState, useEffect } from 'react';
import { X, Wallet, AlertTriangle, Check } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

const WalletRecommendationModal = ({ isOpen, onClose, userType = 'user' }) => {
  const { user } = useUser();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = async () => {
    if (dontShowAgain && user) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/wallet-reminder/${user.id}/${userType}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dismissed: true }),
        });
      } catch (error) {
        console.error('Error saving wallet reminder dismissal:', error);
      }
    }
    onClose();
  };

  const handleLinkWallet = () => {
    // Dispatch custom event to trigger wallet modal
    window.dispatchEvent(new CustomEvent('openWalletModal'));
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-geist">
              Wallet Linking Recommended
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-[#8BC34A] to-[#7CB342] rounded-lg p-4 mb-4">
            <div className="flex items-center text-white">
              <Wallet className="w-6 h-6 mr-3" />
              <div>
                <h3 className="font-semibold">Link Your Crypto Wallet</h3>
                <p className="text-sm opacity-90">For seamless transactions</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <h4 className="font-semibold text-gray-900">Benefits of linking your wallet:</h4>
            <div className="space-y-2">
              <div className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-800">Smooth and secure payment processing</span>
              </div>
              <div className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-800">Real-time transaction tracking</span>
              </div>
              <div className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-800">Faster onboarding process</span>
              </div>
              <div className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-800">Enhanced security and transparency</span>
              </div>
              <div className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-800">Reduced payment disputes</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> You can link your wallet later, but we recommend doing it now for the best experience.
            </p>
          </div>
        </div>

        {/* Don't show again checkbox */}
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="dontShowAgain"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-4 h-4 text-[#8BC34A] bg-gray-100 border-gray-300 rounded focus:ring-[#8BC34A] focus:ring-2"
          />
          <label htmlFor="dontShowAgain" className="ml-2 text-sm text-gray-800">
            Don't show this reminder again
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleLinkWallet}
            className="flex-1 bg-[#8BC34A] text-white py-3 px-4 rounded-lg hover:bg-[#7CB342] transition-colors font-medium"
          >
            Link Wallet Now
          </button>
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletRecommendationModal;
