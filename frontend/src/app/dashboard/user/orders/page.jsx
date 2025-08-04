'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import WalletModal from '../../../../components/WalletModal';

const UserOrders = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/orders/user/${user.id}`);
        const data = await response.json();

        if (data.success) {
          setOrders(data.data);
        } else {
          setError(data.message || 'Failed to fetch orders');
        }
      } catch (error) {
        console.error('Fetch orders error:', error);
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'in_progress':
        return <Truck className="w-5 h-5 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Waiting for Vendor';
      case 'accepted':
        return 'Accepted by Vendor';
      case 'in_progress':
        return 'Collection in Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'cancelled_by_user':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'cancelled_by_user':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleWalletClick = () => {
    setIsWalletModalOpen(true);
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://skrapy-backend.onrender.com'}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          reason: 'Cancelled by user'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh orders list
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: 'cancelled_by_user', cancelledAt: new Date() }
              : order
          )
        );
        alert('Order cancelled successfully.');
      } else {
        alert(data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const canCancelOrder = (order) => {
    // User can cancel until payment is pending (before payment is made)
    return ['pending', 'accepted', 'in_progress'].includes(order.status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3F0] flex items-center justify-center">
        <div className="text-gray-600 font-geist">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3F0] font-geist">
      {/* Header */}
      <header className="px-6 py-12 flex items-center justify-between z-50 max-w-7xl mx-auto">
        <Link href="/dashboard/user/dashboard" className="flex items-center group">
          <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-black mr-2" />
          <span className="text-gray-500 group-hover:text-black group-hover:underline">
            Back to Shop
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleWalletClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <img src="/icons/wallet.svg" alt="Wallet" width={32} height={32} />
          </button>
          <Link href="/dashboard/user">
            <button className="bg-gradient-to-r from-gray-700 to-black text-white px-5 py-2 font-geist rounded-full text-sm font-medium hover:from-gray-600 hover:to-gray-900 transition duration-300">
              Dashboard
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Orders</h1>
          <p className="text-gray-600">Track your scrap collection orders</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any scrap collection orders yet.</p>
            <Link href="/dashboard/user/dashboard">
              <button className="bg-[#8BC34A] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#7CB342] transition-colors duration-300">
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div className="mb-4 lg:mb-0">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-bold text-gray-900 mr-3">
                        Order #{order.orderNumber}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-2">{getStatusText(order.status)}</span>
                      </span>
                    </div>
                    <p className="text-gray-600">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                    {order.acceptedAt && (
                      <p className="text-green-600 text-sm">
                        Accepted on {formatDate(order.acceptedAt)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#8BC34A]">
                      ₹{order.totalAmount}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {order.totalItems} items
                    </div>
                    {canCancelOrder(order) && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Items:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-gray-900">{item.name}</h5>
                            <p className="text-sm text-gray-600">
                              {item.quantity} {item.unit} × ₹{item.price}/{item.unit}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">₹{item.total}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Collection Address:</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-900">{order.userAddress.fullAddress}</p>
                    <p className="text-gray-600">
                      {order.userAddress.city}, {order.userAddress.state} - {order.userAddress.pincode}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Wallet Modal */}
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
        userType="user"
      />
    </div>
  );
};

export default UserOrders;
