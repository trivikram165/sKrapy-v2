'use client';
import React, { useState, useEffect } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import PaymentModal from '../../../../components/PaymentModal';
import WalletModal from '../../../../components/WalletModal';

const VendorOrders = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vendorProfile, setVendorProfile] = useState(null);
  const [vendorWalletAddress, setVendorWalletAddress] = useState('');
  const [active, setActive] = useState('All');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const tabs = ['All', 'Pending', 'Accepted', 'In Progress', 'Payment Pending', 'Completed'];

  // Countdown timer for cooldowns
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.remainingCooldown > 0) {
            const newCooldown = order.remainingCooldown - 1;
            return {
              ...order,
              remainingCooldown: newCooldown,
              canAccept: newCooldown <= 0
            };
          }
          return order;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchVendorProfile = async () => {
      if (!user) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/onboarding/check-profile/${user.id}/vendor`);
        const data = await response.json();

        if (data.success) {
          setVendorProfile(data.user);
        }
      } catch (error) {
        console.error('Fetch vendor profile error:', error);
      }
    };

    fetchVendorProfile();
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !vendorProfile) return;

      try {
        // Fetch available orders in vendor's pincode with cooldown info
        const availableResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/orders/available/${vendorProfile.address.pincode}/${user.id}`);
        const availableData = await availableResponse.json();

        // Fetch vendor's accepted orders
        const myResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/orders/vendor/${user.id}`);
        const myData = await myResponse.json();

        // Combine both arrays
        const allOrders = [
          ...(availableData.success ? availableData.data : []),
          ...(myData.success ? myData.data : [])
        ];

        // Transform orders to match the original format
        const transformedOrders = allOrders.map(order => ({
          orderNumber: order.orderNumber || order._id.slice(-6),
          name: order.userName || `User ${order.userId.slice(-4)}`, // Use actual user name from backend
          location: `${order.userAddress.fullAddress}, ${order.userAddress.city} ${order.userAddress.pincode}`,
          date: new Date(order.createdAt).toLocaleDateString('en-GB'),
          time: new Date(order.createdAt).toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          orderSummary: order.items.map(item => `${item.quantity}${item.unit} ${item.name}`),
          status: order.vendorId ? 
            (order.status === 'accepted' ? 'Accepted' : 
             order.status === 'in_progress' ? 'In Progress' : 
             order.status === 'payment_pending' ? 'Payment Pending' : 
             order.status === 'completed' ? 'Completed' : 'Accepted') : 'Pending',
          action: order.vendorId ? 
            (order.status === 'accepted' ? 'Start' : 
             order.status === 'in_progress' ? 'Pay' : 
             order.status === 'payment_pending' ? 'Awaiting Payment' : 
             order.status === 'completed' ? 'Completed' : 'Accept') : 'Accept',
          orderId: order._id,
          totalAmount: order.totalAmount,
          totalItems: order.totalItems,
          vendorId: order.vendorId,
          userWalletAddress: order.userWalletAddress,
          canAccept: order.canAccept !== undefined ? order.canAccept : true,
          remainingCooldown: order.remainingCooldown || 0
        }));

        setOrders(transformedOrders);
      } catch (error) {
        console.error('Fetch orders error:', error);
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, vendorProfile]);

  const handleAcceptOrder = async (orderNumber) => {
    const order = orders.find(o => o.orderNumber === orderNumber);
    if (!order) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/orders/${order.orderId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId: user.id
        }),
      });

      const data = await response.json();

      if (response.status === 429) {
        // Cooldown period - show remaining time
        const minutes = Math.floor(data.remainingTime / 60);
        const seconds = data.remainingTime % 60;
        const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
        alert(`You cannot accept this order yet. Please wait ${timeString} before trying again.`);
        return;
      }

      if (data.success) {
        // Update the order status locally
        setOrders(prev => prev.map(o => 
          o.orderNumber === orderNumber 
            ? { ...o, status: 'Accepted', action: 'Start', vendorId: user.id }
            : o
        ));
      } else {
        alert(data.message || 'Failed to accept order');
      }
    } catch (error) {
      console.error('Accept order error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleRejectOrder = async (orderNumber) => {
    const order = orders.find(o => o.orderNumber === orderNumber);
    if (!order) return;

    if (!confirm('Are you sure you want to reject this order? You will have to wait 10 minutes before you can accept it again.')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/orders/${order.orderId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId: user.id
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the order with cooldown info
        setOrders(prev => prev.map(o => 
          o.orderNumber === orderNumber 
            ? { ...o, canAccept: false, remainingCooldown: 600 } // 10 minutes
            : o
        ));
        alert('Order rejected. You can accept this order again in 10 minutes.');
      } else {
        alert(data.message || 'Failed to reject order');
      }
    } catch (error) {
      console.error('Reject order error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleUpdateStatus = async (orderNumber, newStatus) => {
    const order = orders.find(o => o.orderNumber === orderNumber);
    if (!order) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/orders/${order.orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the order status locally
        setOrders(prev => prev.map(o => 
          o.orderNumber === orderNumber 
            ? { 
                ...o, 
                status: newStatus === 'in_progress' ? 'In Progress' : 
                        newStatus === 'payment_pending' ? 'Payment Pending' : 'Completed',
                action: newStatus === 'in_progress' ? 'Pay' : 
                        newStatus === 'payment_pending' ? 'Awaiting Payment' : 'Completed'
              }
            : o
        ));
      } else {
        alert(data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Update order status error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const formatCooldownTime = (seconds) => {
    if (seconds <= 0) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `0:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCancelOrder = (orderNumber) => {
    // For now, just change status back to pending locally
    setOrders(prev => prev.map(o => 
      o.orderNumber === orderNumber 
        ? { ...o, status: 'Pending', action: 'Accept', vendorId: null }
        : o
    ));
  };

  const handlePayment = async (order) => {
    // Fetch vendor wallet address before opening payment modal
    let vendorWalletAddress = '';
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/wallet/${user.id}/vendor`);
      const data = await response.json();
      if (data.success && data.data && data.data.walletAddress) {
        vendorWalletAddress = data.data.walletAddress;
      }
    } catch (error) {
      console.error('Error fetching vendor wallet address:', error);
    }

    setSelectedOrder({ ...order, vendorWalletAddress });
    setIsPaymentModalOpen(true);
  };

  const handleWalletClick = () => {
    setIsWalletModalOpen(true);
  };

  const actionStyles = {
    Start: 'bg-orange-500 w-full text-white hover:bg-orange-600 cursor-pointer transition duration-100 ease-in',
    Accept: 'bg-black w-full text-white hover:bg-gray-700 cursor-pointer transition duration-100 ease-in',
    'Accept (Cooldown)': 'bg-gray-400 w-full text-white cursor-not-allowed',
    Reject: 'bg-red-500 w-full text-white hover:bg-red-600 cursor-pointer transition duration-100 ease-in',
    Pay: 'bg-[#aadd66] w-full text-black hover:bg-[#9DCC5E] cursor-pointer transition duration-100 ease-in',
    'Awaiting Payment': 'bg-[#D9D9D9] w-full text-gray-600 cursor-default',
    Completed: 'bg-[#D9D9D9] w-full text-white cursor-default',
  };

  const filteredOrders = orders.filter((order) => {
    if (active === "All") {
      // Hide completed orders from "All" filter
      return order.status !== "Completed";
    } else if (active === "Payment Pending") {
      // Show both "Payment Pending" and "In Progress" orders in Payment Pending filter
      return order.status === "Payment Pending" || order.status === "In Progress";
    } else {
      return order.status === active;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCF9F2] flex items-center justify-center">
        <div className="text-gray-600 font-geist">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#FCF9F2] font-geist'>
      {/* HEADER */}
      <nav className='flex items-center max-w-7xl mx-auto justify-between px-4 sm:px-6 py-12 text-gray-700 text-sm'>
        <Link href='/dashboard/vendor' className='flex items-center group'>
          <img
            src='/icons/orders/left-arrow.png'
            className='w-3 h-3 block group-hover:hidden group-hover:underline'
            alt='arrow'
          />
          <img
            src='/icons/orders/left-arrow-hover.png'
            className='w-3 h-3 hidden group-hover:block group-hover:underline'
            alt='green arrow'
          />
          <span className='ml-1 group-hover:text-black group-hover:underline'>
            Back to Home
          </span>
        </Link>

        <div className='flex items-center space-x-4 cursor-pointer'>
          <button 
            onClick={handleWalletClick}
            className='p-2 rounded-full hover:bg-gray-300 transition duration-200'
          >
            <img src='/icons/wallet.svg' alt='Icon' width={40} height={40} />
          </button>
          <div className='p-2 mt-1'>
            <UserButton />
          </div>
        </div>
      </nav>

      <div className='pb-8'>
        <h2 className='text-gray-900 font-medium text-3xl sm:text-4xl max-w-7xl mx-auto px-4 sm:px-6 py-5'>
          All Orders
        </h2>

        <div className='max-w-7xl mx-auto px-4 sm:px-5'>
          <div className='flex space-x-2 overflow-x-auto pb-2' style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitScrollbar: { display: 'none' }
          }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  active === tab
                    ? "bg-black text-white"
                    : "bg-gray-200 text-black hover:bg-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-7xl mx-auto px-4 sm:px-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

      {/* DESKTOP TABLE & MOBILE CARDS */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6'>
        {/* Desktop Table View */}
        <div className='hidden lg:block rounded-2xl mt-5 overflow-x-auto font-geist'>
          <table className='w-full border-collapse bg-white table-auto'>
            <thead>
              <tr className='bg-[#aadd66] text-center text-sm font-bold text-black'>
                <th className='p-4 px-4 border-r border-2 border-[#F0F0F0] max-w-15'>
                  Order No.
                </th>
                <th className='p-4 px-4 border-r border-2 border-[#F0F0F0]'>
                  Name
                </th>
                <th className='p-4 px-4 border-r border-2 border-[#F0F0F0]'>
                  Location
                </th>
                <th className='p-4 px-4 border-r border-2 border-[#F0F0F0]'>
                  Time
                </th>
                <th className='p-4 px-4 border-r border-2 border-[#F0F0F0]'>
                  Order Summary
                </th>
                <th className='p-4 px-4 border-r border-2 border-[#F0F0F0]'>
                  Status
                </th>
                <th className='p-4 px-4 border-r border-2 border-[#F0F0F0]'>
                  Amount
                </th>
                <th className='p-4 px-4'>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order, index) => {
                const buttonClass = `px-5 py-1 rounded-2xl ${
                  actionStyles[order.action] ||
                  "bg-[#D9D9D9] text-white cursor-default"
                }`;

                return (
                  <tr
                    key={index}
                    className='border-t border-2 border-[#F0F0F0] text-sm bg-[#fbfbfb] text-black text-center'
                  >
                    <td className='p-4 border-r border-2 border-[#F0F0F0]'>
                      {order.orderNumber}
                    </td>
                    <td className='p-4 border-r border-2 border-[#F0F0F0]'>
                      {order.name}
                    </td>
                    <td className='p-4 border-r max-w-60 border-2 border-[#F0F0F0]'>
                      {order.location}
                    </td>
                    <td className='p-4 border-r border-2 border-[#F0F0F0]'>
                      <span className='font-bold'>{order.date}</span>
                      <br />
                      <span className='text-xs'> at {order.time} </span>
                    </td>
                    <td className='p-4 border-r border-2 border-[#F0F0F0] font-medium'>
                      {order.orderSummary.map((item, idx) => (
                        <span key={idx}>
                          {item}
                          {idx < order.orderSummary.length - 1 && <br />}
                        </span>
                      ))}
                    </td>
                    <td
                      className={`p-4 border-r font-bold border-2 border-[#F0F0F0] ${
                        order.status === "Completed"
                          ? "text-[#70707F]"
                          : "text-black"
                      }`}
                    >
                      {order.status}
                    </td>
                    <td className='p-4 border-r border-2 border-[#F0F0F0] font-bold text-[#8BC34A]'>
                      ₹{order.totalAmount}
                    </td>
                    <td className='p-4'>
                      {order.action === "Start" ? (
                        <div className='flex items-center gap-4'>
                          <button 
                            className={buttonClass}
                            onClick={() => handleUpdateStatus(order.orderNumber, 'in_progress')}
                          >
                            {order.action}
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order.orderNumber)}
                            className='bg-gray-200 p-2 rounded-full hover:bg-red-600 cursor-pointer'
                          >
                            <img
                              src='/icons/orders/x.png'
                              alt='Cancel'
                              className='h-3 w-4 object-cover'
                            />
                          </button>
                        </div>
                      ) : order.action === "Accept" ? (
                        <div className='flex items-center gap-2'>
                          {order.canAccept ? (
                            <>
                              <button
                                className={buttonClass}
                                onClick={() => handleAcceptOrder(order.orderNumber)}
                              >
                                Accept
                              </button>
                              <button
                                className='bg-red-500 px-3 py-1 rounded-2xl text-white hover:bg-red-600 cursor-pointer transition duration-100 ease-in'
                                onClick={() => handleRejectOrder(order.orderNumber)}
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <div className='text-center'>
                              <button className='bg-gray-400 px-5 py-1 rounded-2xl text-white cursor-not-allowed w-full'>
                                Accept ({formatCooldownTime(order.remainingCooldown)})
                              </button>
                              <div className='text-xs text-gray-500 mt-1'>
                                Cooldown active
                              </div>
                            </div>
                          )}
                        </div>
                      ) : order.action === "Pay" ? (
                        <button
                          className={buttonClass}
                          onClick={() => handlePayment(order)}
                        >
                          {order.action}
                        </button>
                      ) : (
                        <button className={buttonClass}>{order.action}</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className='lg:hidden mt-5 space-y-4'>
          {filteredOrders.map((order, index) => {
            const buttonClass = `px-4 py-2 rounded-lg text-sm font-medium ${
              actionStyles[order.action] ||
              "bg-[#D9D9D9] text-white cursor-default"
            }`;

            return (
              <div
                key={index}
                className='bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3'
              >
                {/* Header Row */}
                <div className='flex justify-between items-start'>
                  <div>
                    <div className='text-sm font-bold text-gray-900'>
                      #{order.orderNumber}
                    </div>
                    <div className='text-sm text-gray-600 mt-1'>
                      {order.name}
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-lg font-bold text-[#8BC34A]'>
                      ₹{order.totalAmount}
                    </div>
                    <div className={`text-sm font-medium ${
                      order.status === "Completed" ? "text-[#70707F]" : "text-black"
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>

                {/* Location Row */}
                <div className='border-t border-gray-100 pt-3'>
                  <div className='text-sm text-gray-600 mb-1'>📍 Pickup Location</div>
                  <div className='text-sm font-medium text-gray-900'>
                    {order.location}
                  </div>
                </div>

                {/* Time Row */}
                <div className='flex justify-between items-center'>
                  <div>
                    <div className='text-sm text-gray-600'>📅 Date & Time</div>
                    <div className='text-sm font-medium text-gray-900'>
                      {order.date} at {order.time}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <div className='text-sm text-gray-600 mb-1'>📦 Items</div>
                  <div className='text-sm font-medium text-gray-900'>
                    {order.orderSummary.map((item, idx) => (
                      <div key={idx} className='mb-1'>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Row */}
                <div className='border-t border-gray-100 pt-3'>
                  {order.action === "Start" ? (
                    <div className='flex gap-3'>
                      <button 
                        className={`${buttonClass} flex-1`}
                        onClick={() => handleUpdateStatus(order.orderNumber, 'in_progress')}
                      >
                        {order.action}
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order.orderNumber)}
                        className='bg-gray-200 p-2 rounded-lg hover:bg-red-600 transition-colors'
                      >
                        <img
                          src='/icons/orders/x.png'
                          alt='Cancel'
                          className='h-4 w-4 object-cover'
                        />
                      </button>
                    </div>
                  ) : order.action === "Accept" ? (
                    <div className='space-y-2'>
                      {order.canAccept ? (
                        <div className='flex gap-2'>
                          <button
                            className={`${buttonClass} flex-1`}
                            onClick={() => handleAcceptOrder(order.orderNumber)}
                          >
                            Accept
                          </button>
                          <button
                            className='bg-red-500 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-red-600 transition-colors'
                            onClick={() => handleRejectOrder(order.orderNumber)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className='text-center'>
                          <button className='bg-gray-400 px-4 py-2 rounded-lg text-sm font-medium text-white cursor-not-allowed w-full'>
                            Accept ({formatCooldownTime(order.remainingCooldown)})
                          </button>
                          <div className='text-xs text-gray-500 mt-1'>
                            Cooldown active - wait before accepting again
                          </div>
                        </div>
                      )}
                    </div>
                  ) : order.action === "Pay" ? (
                    <button
                      className={`${buttonClass} w-full`}
                      onClick={() => handlePayment(order)}
                    >
                      {order.action}
                    </button>
                  ) : (
                    <button className={`${buttonClass} w-full`}>
                      {order.action}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className='text-center py-12'>
            <div className='text-gray-500 text-lg mb-2'>No orders found</div>
            <div className='text-gray-400 text-sm'>
              {active === 'All' 
                ? 'No orders available in your area yet.' 
                : `No ${active.toLowerCase()} orders at the moment.`
              }
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        order={selectedOrder}
        vendorWalletAddress={selectedOrder?.vendorWalletAddress || ''}
      />

      {/* Wallet Modal */}
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
        userType="vendor"
      />
    </div>
  );
};

export default VendorOrders;