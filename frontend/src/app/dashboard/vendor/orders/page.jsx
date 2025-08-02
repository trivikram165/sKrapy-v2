'use client';
import React, { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

const VendorDashboard = () => {
  const [orders, setOrders] = useState([
    {
      orderNumber: 1,
      name: 'Person A',
      location: 'XYZ house, 7th cross, ABC layout Bangalore 5600XX',
      date: '01.08.2025',
      time: '2:30 PM',
      orderSummary: ['3kg Plastic'],
      status: 'Accepted',
      action: 'Pay',
    },
    {
      orderNumber: 2,
      name: 'Person B',
      location: 'ABC house, 7th cross, ABC layout Bangalore 5600XX',
      date: '01.08.2025',
      time: '2:30 PM',
      orderSummary: ['3kg Plastic', '2kg Newspaper'],
      status: 'Paid',
      action: 'Paid',
    },
    {
      orderNumber: 3,
      name: 'Person C',
      location: 'REF house, 7th cross, ABC layout Bangalore 5600XX',
      date: '01.08.2025',
      time: '2:30 PM',
      orderSummary: ['1kg Aluminium'],
      status: 'Pending',
      action: 'Accept',
    },
  ]);

  const handleCancelOrder = (orderNumber) => {
    const updatedOrders = orders.map((order) =>
      order.orderNumber === orderNumber ? { ...order, status: "Pending", action: "Accept" } : order
    );
    setOrders(updatedOrders);
  };

  const handleAcceptOrder = (orderNumber) => {
    const updatedOrders = orders.map((order) =>
      order.orderNumber === orderNumber
        ? { ...order, status: "Accepted", action: "Pay" }
        : order
    );
    setOrders(updatedOrders);
  };


  const [active, setActive] = useState('All');
  const tabs = ['All', 'Pending', 'Accepted', 'Paid'];

  const actionStyles = {
    Pay: 'bg-[#aadd66] w-full text-black hover:bg-[#9DCC5E] cursor-pointer transition duration-100 ease-in',
    Accept: 'bg-black w-full text-white hover:bg-gray-700 cursor-pointer transition duration-100 ease-in',
    Paid: 'bg-[#D9D9D9] w-full text-white cursor-default',
  };

  const filteredOrders = orders.filter((order) =>
    active === "All" ? true : order.status === active
  );

  return (
    <div className='min-h-screen bg-[#FCF9F2] py-16 px-4 font-geist'>
      {/* HEADER */}
      <nav className='flex items-center max-w-7xl mx-auto justify-between px-6 py-4 text-gray-700 text-sm'>
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
          <div className='p-2 rounded-full hover:bg-gray-300 transition duration-200'>
            <img src='/icons/wallet.svg' alt='Icon' width={40} height={40} />
          </div>
          <div className='p-2 mt-1'>
            <UserButton />
          </div>
        </div>
      </nav>

      <h2 className='text-gray-900 font-medium text-4xl max-w-7xl mx-auto px-6 py-5'>
        All Orders
      </h2>

      <div className='flex space-x-2 max-w-7xl mx-auto px-5'>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer ${
              active === tab
                ? "bg-black text-white"
                : "bg-gray-200 text-black hover:bg-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TABLE (Wrapped to match header alignment) */}
      <div className='max-w-7xl mx-auto px-6'>
        <div className='rounded-2xl mt-5 flex items-center justify-center overflow-x-auto font-geist'>
          <table className='w-7xl border-collapse bg-white table-auto'>
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
                      {order.orderSummary.map((item, index) => (
                        <span key={index}>
                          {item}
                          {index < order.orderSummary.length - 1 && <br />}
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
                    <td className='p-4'>
                        {order.action === "Pay" ? (
                            <div className='flex items-center gap-4'>
                            <button className={buttonClass}>
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
                            <button
                            className={buttonClass}
                            onClick={() => handleAcceptOrder(order.orderNumber)}
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
      </div>
    </div>
  );
};

export default VendorDashboard;