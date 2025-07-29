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
    );
};

const WhyChooseFeatures = () => {
    return (
        <div className="grid grid-rows-3 grid-cols-2 gap-5 font-geist mt-5 max-w-6xl mx-auto">
            {[
                {
                    icon: "box",
                    title: "Doorstep Pickup",
                    desc: "Seamless scrap collection from the comfort of your own house or office",
                },
                {
                    icon: "upward-trend",
                    title: "Live Pricing",
                    desc: "Real-time scrap prices linked to global indices — no guesswork, no haggling.",
                },
                {
                    icon: "verified",
                    title: "Verified Vendors",
                    desc: "Only pre-screened, trusted vendors handle your scrap.",
                },
                {
                    icon: "robot",
                    title: "AI-Powered Technology",
                    desc: "Cutting-edge AI for photo verification, quality checks, and smart route optimization.",
                },
                {
                    icon: "star",
                    title: "Rewards & Token Cashback",
                    desc: "Earn tokens or cashback every time you recycle. It pays to be sustainable!",
                },
                {
                    icon: "globe",
                    title: "Blockchain Integration",
                    desc: "Leverage blockchain for secure, transparent, and traceable transactions in your recycling journey.",
                },
            ].map(({ icon, title, desc }) => (
                <div key={icon} className="flex flex-col p-5 rounded-3xl bg-white shadow-sm">
                    <div className="w-fit p-5 rounded-4xl bg-[#A9DD66] mb-5">
                        <img
                            src={`/icons/whyUs/${icon}.png`}
                            alt={title}
                            className="rounded-2xl w-10"
                        />
                    </div>
                    <p className="text-black text-2xl font-semibold mb-5">{title}</p>
                    <p className="text-gray-500 text-base font-medium mb-5">{desc}</p>
                </div>
            ))}
        </div>
    );
};

const WhyUs = () => {
    return (
        <div className="min-h-screen bg-[#FCF9F2] py-16 px-4 place-items-center">
            <Header />
            <WhyChooseFeatures />
        </div>
    );
};

export default WhyUs;