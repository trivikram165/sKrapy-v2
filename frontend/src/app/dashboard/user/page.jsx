'use client';
import React from 'react';
import { UserButton, useUser } from '@clerk/nextjs';

const UserDashboard = () => {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-[#FCF9F2] py-16 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center bg-white rounded-2xl shadow-sm px-6 py-4">
          <h1 className="text-2xl font-medium text-gray-900 font-geist">
            User Dashboard
          </h1>
          <UserButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-medium text-gray-900 mb-4 font-geist">
              Welcome, {user?.firstName || 'User'}!
            </h2>
            <p className="text-lg text-gray-600 font-geist">
              Start selling your scrap materials and earn money while helping the environment.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#EBF0DD] rounded-xl p-6 text-center border border-[#DFE6D3]">
              <h3 className="text-xl font-medium text-gray-900 mb-2 font-geist">
                List Your Scrap
              </h3>
              <p className="text-gray-600 mb-4 font-geist text-sm">
                Upload photos and details of your scrap materials
              </p>
              <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-geist font-medium hover:bg-gray-800 transition-all">
                Add Items
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
              <h3 className="text-xl font-medium text-gray-900 mb-2 font-geist">
                Track Orders
              </h3>
              <p className="text-gray-600 mb-4 font-geist text-sm">
                Monitor the status of your scrap sales
              </p>
              <button className="bg-[#8BC34A] text-white px-6 py-2 rounded-lg font-geist font-medium hover:bg-[#7CB342] transition-all">
                View Orders
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
              <h3 className="text-xl font-medium text-gray-900 mb-2 font-geist">
                Earnings
              </h3>
              <p className="text-gray-600 mb-4 font-geist text-sm">
                Check your total earnings and payment history
              </p>
              <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-geist font-medium hover:bg-gray-800 transition-all">
                View Earnings
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4 font-geist">
              Recent Activity
            </h3>
            <p className="text-gray-600 font-geist">
              No recent activity. Start by listing your first scrap item!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
