'use client';
import React, { useState } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Orders from '../orders/page';

const dummyData = [
    {
        orderNumber: 1,
        name: 'qwerty',
        location: 'XYZ house, 7th cross, ABC layout Bangalore 5600XX',
        date: '01.08.2025',
        time: '2:30 PM',
        orderSummary: ['3kg Plastic'],
        status: 'Accepted',
        action: 'Pay',
    },
    {
        orderNumber: 2,
        name: 'zxcvb',
        location: 'ABC house, 7th cross, ABC layout Bangalore 5600XX',
        date: '01.08.2025',
        time: '2:30 PM',
        orderSummary: ['3kg Plastic', '2kg Newspaper'],
        status: 'Completed',
        action: 'Paid',
    },
    {
        orderNumber: 3,
        name: 'asdfg',
        location: 'REF house, 7th cross, ABC layout Bangalore 5600XX',
        date: '01.08.2025',
        time: '2:30 PM',
        orderSummary: ['1kg Aluminium'],
        status: 'Pending',
        action: 'Accept',
    },
];

const VendorDashboard = () => {
    const [active, setActive] = useState('All');
    const tabs = ['All', 'Pending', 'Accepted', 'Paid'];

    const actionStyles = {
        Pay: 'bg-[#aadd66] text-black hover:bg-[#9DCC5E] cursor-pointer transition duration-100 ease-in',
        Accept: 'bg-black text-white hover:bg-gray-700 cursor-pointer transition duration-100 ease-in',
        Paid: 'bg-[#D9D9D9] text-white cursor-default',
    };

    return (
        <div className="min-h-screen bg-[#FCF9F2] py-5 px-4">
            {/* HEADER - Navbar */}
            <nav className="flex items-center justify-between px-6 py-4">
                <img src="/logo/logo1.svg" alt="Logo" className="h-7" />

                <div className="flex items-center space-x-4 cursor-pointer">
                    {/* Wallet Icon */}
                    <div className="p-2 rounded-full hover:bg-gray-300 transition duration-200">
                    <img
                        src="/icons/orders/wallet.png"
                        alt="Icon"
                        className="h-6 w-6 rounded-full object-cover"
                    />
                    </div>

                    {/* Profile Icon */}
                    <div className="p-2 rounded-full hover:bg-gray-300 transition duration-200">
                    <img
                        src="/icons/orders/pfp.png"
                        alt="Profile"
                        className="h-7 w-7 rounded-full object-cover"
                    />
                    </div>
                </div>
            </nav>


            {/* HEADING */}
            <h2 className="text-gray-900 font-bold text-4xl px-5 py-5">Vendor Dashboard</h2>

            {/* STATUS FILTER */}
            <div className="flex space-x-2 px-4">
                {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActive(tab)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer ${
                        active === tab ? 'bg-black text-white' : 'bg-gray-200 text-black hover:bg-gray-300'
                    }`}
                >
                    {tab}
                </button>
                ))}
            </div>

            {/* MAIN DASHBOARD SECTION */}
            <div className="rounded-2xl mt-5 flex items-center justify-center overflow-x-auto shadow-md font-geist">
                <table className="min-w-[1450px] border-collapse bg-white w-full table-auto">
                    <thead>
                        <tr className="bg-[#aadd66] text-center text-sm font-bold text-black">
                            <th className="p-4 px-4 border-r border-2 border-[#F0F0F0]"> Order No. </th>
                            <th className="p-4 px-4 border-r border-2 border-[#F0F0F0]"> Name </th>
                            <th className="p-4 px-4 border-r border-2 border-[#F0F0F0]"> Location </th>
                            <th className="p-4 px-4 border-r border-2 border-[#F0F0F0]"> Time </th>
                            <th className="p-4 px-4 border-r border-2 border-[#F0F0F0]"> Order Summary </th>
                            <th className="p-4 px-4 border-r border-2 border-[#F0F0F0]"> Status </th>
                            <th className="p-4 px-4">Action</th>
                        </tr>
                    </thead>
                    
                    <tbody>
                        {dummyData.map((order, index) => {
                        const buttonClass = `px-5 py-1 rounded-2xl ${
                            actionStyles[order.action] || 'bg-[#D9D9D9] text-white cursor-default'
                        }`;

                        return (
                            <tr
                            key={index}
                            className="border-t border-2 border-[#F0F0F0] text-sm bg-[#fbfbfb] text-black text-center"
                            >
                            <td className="p-4 border-r border-2 border-[#F0F0F0]">{order.orderNumber}</td>
                            <td className="p-4 border-r border-2 border-[#F0F0F0] text-left">{order.name}</td>
                            <td className="p-4 border-r max-w-60 border-2 border-[#F0F0F0]">{order.location}</td>
                            <td className="p-4 border-r border-2 border-[#F0F0F0]">
                                <span className="font-bold">{order.date}</span>
                                <br />
                                <span className="text-xs"> at {order.time} </span>
                            </td>
                            <td className="p-4 border-r border-2 border-[#F0F0F0] font-medium">
                                {order.orderSummary.map((item, index) => (
                                <span key={index}>
                                    {item}
                                    {index < order.orderSummary.length - 1 && <br />}
                                </span>
                                ))}
                            </td>
                            <td
                                className={`p-4 border-r font-bold border-2 border-[#F0F0F0] ${
                                order.status === 'Completed' ? 'text-[#70707F]' : 'text-black'
                                }`}
                            >
                                {order.status}
                            </td>
                            <td className="p-4">
                                <button className={buttonClass}>{order.action}</button>
                            </td>
                            </tr>
                        );
                        })}
                    </tbody>
                </table>
            </div>
            <p className="text-black text-xs mt-5 ml-5 hover:underline cursor:pointer">
                <Link href="/dashboard/vendor">
                    &lt; Back to main dashboard
                </Link>
            </p>
        </div>
    );
};

export default VendorDashboard;