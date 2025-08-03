'use client';
import React, { useState, useEffect } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import WalletModal from '../../../components/WalletModal';
import WalletRecommendationModal from '../../../components/WalletRecommendationModal';

const DashboardUser = () => {
  const { user } = useUser();
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isWalletRecommendationOpen, setIsWalletRecommendationOpen] = useState(false);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!user) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/orders/user/${user.id}`);
        const data = await response.json();

        if (data.success) {
          // Get only the 3 most recent orders
          setRecentOrders(data.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Fetch recent orders error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, [user]);

  // Check wallet recommendation modal
  useEffect(() => {
    if (!loading && user) {
      checkWalletRecommendation();
    }
  }, [loading, user]);

  const checkWalletRecommendation = async () => {
    try {
      // Check wallet address
      const walletResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/wallet/${user.id}/user`);
      const walletData = await walletResponse.json();
      
      // Check reminder dismissal status
      const reminderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/wallet-reminder/${user.id}/user`);
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

  return (
    <div className='min-h-screen font-geist bg-[#FCF9F2] py-16 px-4'>
      {/* Header */}
      <div className='max-w-7xl mx-auto mb-8'>
        <div className='flex justify-between itemss-center rounded-2xl px-2 py-4'>
          <h1 className='text-3xl sm:text-4xl font-medium text-gray-900 font-geist'>
            User Dashboard
          </h1>
          <div className='flex justify-between items-center gap-4 sm:gap-8'>
            <button 
              onClick={handleWalletClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <img src="../icons/wallet.svg" alt="Wallet Icon" width={40} height={40}/>
            </button>
            <UserButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto font-geist'>
        <div className='bg-white rounded-2xl shadow-sm p-8'>
          <div className='text-center mb-8'>
            <h2 className='text-4xl font-medium text-gray-900 mb-4 font-geist'>
              Welcome, {user?.username || "User"}!
            </h2>
            <p className='text-lg text-gray-600 font-geist'>
              Start selling your scrap materials and earn money while helping
              the environment.
            </p>
          </div>

          {/* Quick Actions */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='bg-[#EBF0DD] rounded-xl p-6 text-center border border-[#DFE6D3]'>
              <h3 className='text-xl font-medium text-gray-900 mb-2 font-geist'>
                List Your Scrap
              </h3>
              <p className='text-gray-600 mb-4 font-geist text-sm'>
                Upload photos and details of your scrap materials
              </p>
              <button className='bg-gray-900 text-white px-6 py-2 rounded-lg font-geist font-medium hover:bg-gray-800 transition-all'>
                Coming Soon
              </button>
            </div>

            <div className='bg-white rounded-xl p-6 text-center border border-gray-200'>
              <h3 className='text-xl font-medium text-gray-900 mb-2 font-geist'>
                Sell Scrap Materials
              </h3>
              <p className='text-gray-600 mb-4 font-geist text-sm'>
                Browse and order newspaper, metal, plastic & more
              </p>
              <Link href='/dashboard/user/dashboard'>
                <button className='bg-[#8BC34A] text-white px-6 py-2 rounded-lg font-geist font-medium hover:bg-[#7CB342] transition-all'>
                  Browse Scrap
                </button>
              </Link>
            </div>

            <div className='bg-white rounded-xl p-6 text-center border border-gray-200'>
              <h3 className='text-xl font-medium text-gray-900 mb-2 font-geist'>
                Earnings
              </h3>
              <p className='text-gray-600 mb-4 font-geist text-sm'>
                Check your total earnings and payment history
              </p>
              <button className='bg-gray-900 text-white px-6 py-2 rounded-lg font-geist font-medium hover:bg-gray-800 transition-all'>
                Coming Soon
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className='bg-gray-50 rounded-xl p-6'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-xl font-medium text-gray-900 font-geist'>
                Recent Activity
              </h3>
              <Link href='/dashboard/user/orders' className='text-[#8BC34A] hover:text-[#7CB342] font-medium text-sm'>
                View All Orders
              </Link>
            </div>
            
            {loading ? (
              <div className='flex items-center justify-center py-8'>
                <div className='w-6 h-6 border-2 border-[#8BC34A] border-t-transparent rounded-full animate-spin'></div>
                <span className='ml-2 text-gray-600'>Loading recent orders...</span>
              </div>
            ) : recentOrders.length === 0 ? (
              <p className='text-gray-600 font-geist'>
                No recent activity. Start by placing your first order!
              </p>
            ) : (
              <div className='space-y-4'>
                {recentOrders.map((order) => (
                  <div key={order._id} className='bg-white rounded-lg p-4 border border-gray-200'>
                    <div className='flex justify-between items-start mb-2'>
                      <div>
                        <h4 className='font-medium text-gray-900'>Order #{order.orderNumber}</h4>
                        <p className='text-sm text-gray-500'>
                          {new Date(order.createdAt).toLocaleDateString('en-GB')} at{' '}
                          {new Date(order.createdAt).toLocaleTimeString('en-GB', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='font-bold text-[#8BC34A]'>₹{order.totalAmount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                          order.status === 'payment_pending' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'pending' ? 'Pending' :
                           order.status === 'accepted' ? 'Accepted' :
                           order.status === 'in_progress' ? 'In Progress' :
                           order.status === 'payment_pending' ? 'Payment Pending' :
                           order.status === 'completed' ? 'Completed' : order.status}
                        </span>
                      </div>
                    </div>
                    <div className='text-sm text-gray-600'>
                      <span className='font-medium'>{order.totalItems} items:</span>{' '}
                      {order.items.slice(0, 2).map(item => `${item.quantity}${item.unit || 'kg'} ${item.name}`).join(', ')}
                      {order.items.length > 2 && ` +${order.items.length - 2} more`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wallet Modal */}
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
        userType="user"
      />

      {/* Wallet Recommendation Modal */}
      <WalletRecommendationModal
        isOpen={isWalletRecommendationOpen}
        onClose={() => setIsWalletRecommendationOpen(false)}
        userType="user"
      />
    </div>
  );
};

export default DashboardUser;
