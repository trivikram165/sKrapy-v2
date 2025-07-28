"use client";

import React, { useEffect, useRef, useState } from "react";

const Header = () => {
    return (
        <>
            <div className='text-center'>
                <div className='inline-flex items-center bg-gray-900 text-white px-4 py-1.5 rounded-full text-xs mb-6 font-geist shadow-lg border border-gray-700'>
                    Why Us
                </div>
            </div>

            <div className="grid grid-rows-2 gap-2 items-center text-center font-geist">
                <div className="text-black text-5xl font-medium"> Why Choose sKrapy? </div>
                <div className="text-gray-500 text-xl"> Because We're Not Just Another Scrap Platform </div>
            </div>
        </>
    )
}

const WhyChooseFeatures = () => {
    return (
        <>
            <div className="grid grid-rows-3 grid-cols-2 gap-5 font-geist mt-5 max-w-6xl">

                <div className="flex flex-col p-5 rounded-3xl bg-white">
                    <div className="w-fit p-5 rounded-4xl bg-[#A9DD66] mb-5">
                        <img 
                            src="/icons/whyUs/box.png" 
                            alt="Doorstep Pickup"
                            className='rounded-2xl w-10'
                        />
                    </div>
                    <p className="text-black text-2xl font-semibold mb-5"> Doorstep Pickup </p>
                    <p className="text-gray-500 text-base font-medium mb-5"> Seamless scrap collection from the comfort of your own house or office </p>
                </div>

                <div className="flex flex-col p-5 rounded-3xl bg-white">
                    <div className="w-fit p-5 rounded-4xl bg-[#A9DD66] mb-5">
                        <img 
                            src="/icons/whyUs/upward-trend.png" 
                            alt="Live Pricing"
                            className='rounded-2xl w-10'
                        />
                    </div>
                    <p className="text-black text-2xl font-semibold mb-5"> Live Pricing </p>
                    <p className="text-gray-500 text-base font-medium mb-5"> Real-time scrap prices linked to global indices — no guesswork, no haggling. </p>
                </div>

                <div className="flex flex-col p-5 rounded-3xl bg-white">
                    <div className="w-fit p-5 rounded-4xl bg-[#A9DD66] mb-5">
                        <img 
                            src="/icons/whyUs/verified.png" 
                            alt="Verified Vendors"
                            className='rounded-2xl w-10'
                        />
                    </div>
                    <p className="text-black text-2xl font-semibold mb-5"> Verified Vendors </p>
                    <p className="text-gray-500 text-base font-medium mb-5"> Only pre-screened, trusted vendors handle your scrap. </p>
                </div>

                <div className="flex flex-col p-5 rounded-3xl bg-white">
                    <div className="w-fit p-5 rounded-4xl bg-[#A9DD66] mb-5">
                        <img 
                            src="/icons/whyUs/robot.png" 
                            alt="AI Technology"
                            className='rounded-2xl w-10'
                        />
                    </div>
                    <p className="text-black text-2xl font-semibold mb-5"> AI-Powered Technology </p>
                    <p className="text-gray-500 text-base font-medium mb-5"> Cutting-edge AI for photo verification, quality checks, and smart route optimization. </p>
                </div>

                <div className="flex flex-col p-5 rounded-3xl bg-white">
                    <div className="w-fit p-5 rounded-4xl bg-[#A9DD66] mb-5">
                        <img 
                            src="/icons/whyUs/star.png" 
                            alt="Rewards"
                            className='rounded-2xl w-10'
                        />
                    </div>
                    <p className="text-black text-2xl font-semibold mb-5"> Rewards & Token Cashback </p>
                    <p className="text-gray-500 text-base font-medium mb-5"> Earn tokens or cashback every time you recycle. It pays to be sustainable! </p>
                </div>

                <div className="flex flex-col p-5 rounded-3xl bg-white">
                    <div className="w-fit p-5 rounded-4xl bg-[#A9DD66] mb-5">
                        <img 
                            src="/icons/whyUs/globe.png" 
                            alt="Blockchain Integration"
                            className='rounded-2xl w-10'
                        />
                    </div>
                    <p className="text-black text-2xl font-semibold mb-5"> Blockchain Integration </p>
                    <p className="text-gray-500 text-base font-medium mb-5"> Earn tokens or cashback every time you recycle. It pays to be sustainable! </p>
                </div>

            </div>
        </>
    )
}

const WhyUs = () => {
    return (
        <div className='min-h-screen bg-gray-100 py-16 px-4 place-items-center'>
            <Header />
            <WhyChooseFeatures />
        </div>
    )
}

export default WhyUs;