'use client';
import React, { useEffect, useState } from 'react';
import { UserButton, useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Orders from './orders/page';
import WalletModal from '../../../components/WalletModal';
import WalletRecommendationModal from '../../../components/WalletRecommendationModal';

const VendorDashboard = () => {
  const { user } = useUser();
  const { isLoaded } = useAuth();
  const router = useRouter();
  const [profileChecked, setProfileChecked] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isWalletRecommendationOpen, setIsWalletRecommendationOpen] = useState(false);

  useEffect(() => {
    const checkVendorProfile = async () => {
      if (!isLoaded) {
        console.log('VendorDashboard: Clerk not loaded yet');
        return;
      }
      
      if (!user) {
        console.log('VendorDashboard: No user object - redirecting to sign in');
        router.push('/sign-in');
        return;
      }

      try {
        console.log('VendorDashboard: User object:', user);
        console.log('VendorDashboard: User ID:', user.id);
        console.log('VendorDashboard: Checking vendor profile for:', user.id);
        
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/onboarding/check-profile/${user.id}/vendor`;
        console.log('VendorDashboard: Making request to:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        console.log('VendorDashboard: Profile check response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('VendorDashboard: Error response:', errorText);
          console.log('VendorDashboard: No vendor profile found, redirecting to onboarding');
          router.push('/onboarding?role=vendor');
          return;
        }

        const data = await response.json();
        console.log('VendorDashboard: Profile check data:', data);

        if (!data.success || !data.profileCompleted) {
          console.log('VendorDashboard: Vendor profile not completed, redirecting to onboarding');
          router.push('/onboarding?role=vendor');
          return;
        }

        console.log('VendorDashboard: Vendor profile completed, allowing access');
        setProfileChecked(true);
      } catch (error) {
        console.error('VendorDashboard: Profile check error:', error);
        router.push('/onboarding?role=vendor');
      }
    };

    checkVendorProfile();
  }, [user, router, isLoaded]);

  // Check wallet recommendation modal
  useEffect(() => {
    if (profileChecked && user) {
      checkWalletRecommendation();
    }
  }, [profileChecked, user]);

  const checkWalletRecommendation = async () => {
    try {
      // Check wallet address
      const walletResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/wallet/${user.id}/vendor`);
      const walletData = await walletResponse.json();
      
      // Check reminder dismissal status
      const reminderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/wallet-reminder/${user.id}/vendor`);
      const reminderData = await reminderResponse.json();
      
      const hasWallet = walletData.success && walletData.data && walletData.data.walletAddress;
      const reminderDismissed = reminderData.success && reminderData.data && reminderData.data.walletReminderDismissed;
      
      if (!hasWallet && !reminderDismissed) {
        setIsWalletRecommendationOpen(true);
      }
    } catch (error) {
      console.error('Error checking wallet status:', error);
      // On error, show recommendation as fallback
      setIsWalletRecommendationOpen(true);
    }
  };

  // Listen for wallet modal open event
  useEffect(() => {
    const handleOpenWalletModal = () => {
      setIsWalletModalOpen(true);
    };

    window.addEventListener('openWalletModal', handleOpenWalletModal);
    
    return () => {
      window.removeEventListener('openWalletModal', handleOpenWalletModal);
    };
  }, []);

  const handleWalletClick = () => {
    setIsWalletModalOpen(true);
  };

  if (!isLoaded || !user || !profileChecked) {
    return (
      <div className="min-h-screen bg-[#FCF9F2] flex items-center justify-center">
        <div className="text-gray-600 font-geist">Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen font-geist bg-[#FCF9F2] py-16 px-4'>
      {/* Header */}
      <div className='max-w-7xl mx-auto mb-8'>
        <div className='flex justify-between items-center rounded-2xl px-2 py-4'>
          <h1 className='text-3xl sm:text-4xl font-medium text-gray-900 font-geist'>
            Vendor Dashboard
          </h1>
          <div className='flex justify-between items-center gap-8'>
            <button 
              onClick={handleWalletClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <img
                src='../icons/wallet.svg'
                alt='Wallet Icon'
                width={40}
                height={40}
              />
            </button>
            <UserButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto'>
        <div className='bg-white rounded-2xl shadow-sm p-8'>
          <div className='text-center mb-8'>
            <h2 className='text-4xl font-medium text-gray-900 mb-4 font-geist'>
              Welcome, {user?.username || "Vendor"}!
            </h2>
            <p className='text-lg text-gray-600 font-geist'>
              Discover and purchase quality scrap materials from verified
              sellers.
            </p>
          </div>

          {/* Quick Actions */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='bg-[#EBF0DD] rounded-xl p-6 text-center border border-[#DFE6D3]'>
              <h3 className='text-xl font-medium text-gray-900 mb-2 font-geist'>
                Browse Scrap
              </h3>
              <p className='text-gray-600 mb-4 font-geist text-sm'>
                Explore available scrap materials from sellers
              </p>
              <button className='bg-gray-900 text-white px-6 py-2 rounded-lg font-geist font-medium hover:bg-gray-800 transition-all'>
                Coming Soon
              </button>
            </div>

            <div className='bg-white rounded-xl p-6 text-center border border-gray-200'>
              <h3 className='text-xl font-medium text-gray-900 mb-2 font-geist'>
                Manage Orders
              </h3>
              <p className='text-gray-600 mb-4 font-geist text-sm'>
                Track your purchases and deliveries
              </p>
              <Link href="/dashboard/vendor/orders">
                <button className='bg-[#8BC34A] text-white px-6 py-2 rounded-lg font-geist font-medium hover:bg-[#7CB342] transition-all'>
                  View Orders
                </button>
              </Link>
            </div>

            <div className='bg-white rounded-xl p-6 text-center border border-gray-200'>
              <h3 className='text-xl font-medium text-gray-900 mb-2 font-geist'>
                Analytics
              </h3>
              <p className='text-gray-600 mb-4 font-geist text-sm'>
                View your purchase history and spending
              </p>
              <button className='bg-gray-900 text-white px-6 py-2 rounded-lg font-geist font-medium hover:bg-gray-800 transition-all'>
                Coming Soon
              </button>
            </div>
          </div>

          {/* Inventory Management */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            <div className='bg-gray-50 rounded-xl p-6'>
              <h3 className='text-xl font-medium text-gray-900 mb-4 font-geist'>
                Inventory Overview
              </h3>
              <p className='text-gray-600 font-geist'>
                No inventory items yet. Start by purchasing your first scrap
                materials!
              </p>
            </div>

            <div className='bg-gray-50 rounded-xl p-6'>
              <h3 className='text-xl font-medium text-gray-900 mb-4 font-geist'>
                Recent Purchases
              </h3>
              <p className='text-gray-600 font-geist'>
                No recent purchases. Browse available scrap to get started!
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='bg-white rounded-lg p-4 border border-gray-200 text-center'>
              <div className='text-2xl font-bold text-gray-900 font-geist'>
                0
              </div>
              <div className='text-sm text-gray-600 font-geist'>
                Total Orders
              </div>
            </div>
            <div className='bg-white rounded-lg p-4 border border-gray-200 text-center'>
              <div className='text-2xl font-bold text-gray-900 font-geist'>
                ₹0
              </div>
              <div className='text-sm text-gray-600 font-geist'>
                Total Spent
              </div>
            </div>
            <div className='bg-white rounded-lg p-4 border border-gray-200 text-center'>
              <div className='text-2xl font-bold text-gray-900 font-geist'>
                0
              </div>
              <div className='text-sm text-gray-600 font-geist'>
                Active Orders
              </div>
            </div>
            <div className='bg-white rounded-lg p-4 border border-gray-200 text-center'>
              <div className='text-2xl font-bold text-gray-900 font-geist'>
                0
              </div>
              <div className='text-sm text-gray-600 font-geist'>
                Saved Items
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Modal */}
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
        userType="vendor"
      />

      {/* Wallet Recommendation Modal */}
      <WalletRecommendationModal
        isOpen={isWalletRecommendationOpen}
        onClose={() => setIsWalletRecommendationOpen(false)}
        userType="vendor"
      />
    </div>
  );
};

export default VendorDashboard;
