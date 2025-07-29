'use client';
import React from 'react';
import { SignUpButton } from '@clerk/nextjs';

const UserTypeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="float-right text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          ×
        </button>
        
        {/* Modal content */}
        <div className="text-center pt-4">
          <h2 className="text-3xl font-medium text-gray-900 mb-4 font-geist">
            Choose Your Role
          </h2>
          <p className="text-gray-600 mb-8 font-geist">
            Are you looking to sell scrap or buy scrap materials?
          </p>
          
          <div className="space-y-4">
            {/* User/Seller Button */}
            <SignUpButton 
              mode="modal"
              forceRedirectUrl="/dashboard/user"
              signInForceRedirectUrl="/dashboard/user"
            >
              <button className="w-full bg-[#EBF0DD] text-gray-800 px-8 py-4 rounded-lg font-geist font-medium hover:bg-[#DFE6D3] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-[#DFE6D3]">
                I'm a User (Sell Scrap)
              </button>
            </SignUpButton>
            
            {/* Vendor/Buyer Button */}
            <SignUpButton 
              mode="modal"
              forceRedirectUrl="/dashboard/vendor"
              signInForceRedirectUrl="/dashboard/vendor"
            >
              <button 
                className="w-full text-white px-8 py-4 rounded-lg font-geist font-medium hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl" 
                style={{ background: 'linear-gradient(to right, white -123%, black 74%)' }}
              >
                I'm a Vendor (Buy Scrap)
              </button>
            </SignUpButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeModal;
