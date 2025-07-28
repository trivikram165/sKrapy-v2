"use client";

import React, { useEffect, useRef, useState } from "react";

const Header = () => {
    return (
        <>
            <div className='text-center mb-12'>
                <div className='inline-flex items-center bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm mb-6 font-geist shadow-lg border border-gray-700'>
                    <div className='w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse'></div>
                    Why Us
                </div>
            </div>

            <div className="">
                <div className=""> Why Choose sKrapy? </div>
                <div className=""> Because We're Not Just Another Scrap Platform </div>
            </div>
        </>
    )
}

const WhyChooseFeatures = () => {
    return (
        <>
            <div className="grid-rows-3 grid-columns-2 gap-5">
                <div className="">
                    <h4> Doorstep Pickup </h4>
                    <p> Seamless scrap collection from the comfort of your own house or office </p>
                </div>
            </div>
        </>
    )
}

const WhyUs = () => {
    return (
        <>
            <Header />
            <WhyChooseFeatures />
        </>
    )
}

export default WhyUs;