"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParallaxScroll, useLoadAnimation } from "./Prices";


const Header = () => {
    
    const [parallaxRef, scrollY] = useParallaxScroll(0.3);
    const [loadRef, isVisible] = useLoadAnimation();

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };

    const phrase = ["Why", "Choose", "sKrapy?"];
    const [visibleWords, setVisibleWords] = useState([]);
    const [showSubtext, setShowSubtext] = useState(false);

    useEffect(() => {
        if (!isVisible) return;

        const writeLoop = async () => {
            for (let i = 0; i < phrase.length; i++) {
                setVisibleWords((previous) => [...previous, phrase[i]]);
                if (i === 1) {
                    setTimeout(() => setShowSubtext(true), 250);
                }
                sleep(250);
            }
        };
        writeLoop();
    }, [isVisible]);

    return (
        <>
            <div className='text-center'>
                <div className='inline-flex items-center bg-gray-900 text-white px-4 py-1.5 rounded-full text-xs mb-6 font-geist shadow-lg border border-gray-700'>
                    Why Us
                </div>
            </div>

            <div ref={loadRef} className="grid grid-rows-2 gap-2 items-center text-center font-geist">
                <div ref={parallaxRef} className={`text-black text-5xl font-medium leading-tight 
                }`}>
                    {visibleWords.map((word, index) => (
                        <span
                            key={index}
                            className="inline-block opacity-0 animate-fade-in"
                            style={{
                                animationDelay: `${index * 0.3}s`,
                                animationFillMode: "forwards",
                            }}>
                            {word}&nbsp;
                        </span>
                    ))}
                </div>
                <div
                    ref={parallaxRef}
                    className={`text-gray-500 text-xl leading-relaxed transition-all duration-700 ease-out
                        ${showSubtext ? "opacity-100 scale-100 animate-fade-in-delay" : "opacity-0 scale-95"}
                    `}
                    >
                    Because We're Not Just Another Scrap Platform
                </div>

            </div>

            <style jsx >{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(15px);
                        filter: blur(5px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }

                .animate-fade-in-delay {
                    animation: fade-in 0.8s ease-out 0.3s both;
                }
            `}
            </style>
        </>
    );
};

const WhyChooseFeatures = () => {

    const [parallaxRef, scrollY] = useParallaxScroll(0.3);
    const [loadRef, isVisible] = useLoadAnimation();
    
    return (
        <div ref={loadRef} className="grid grid-rows-3 grid-cols-2 gap-5 font-geist mt-5 max-w-6xl mx-auto">
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
                <div key={icon} ref={parallaxRef} className={`flex flex-col p-5 rounded-3xl bg-white shadow-sm transition-all duration-1000 ease-out ${
                    isVisible
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 translate-y-8"
                }`}
                style={{
                    transform: `translate(0, 1%) translateY(${scrollY}px)`,
                }}
                >
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
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);
    
    if (!mounted) {
        return (
            <div id="why-us" className="min-h-screen bg-[#FCF9F2] py-16 px-4 place-items-center">
                <Header />
                <div className="text-center py-20">
                    <div className="text-gray-500">Loading...</div>
                </div>
            </div>
        );
    }
    
    return (
        <div id="why-us" className="min-h-screen bg-[#FCF9F2] py-16 px-4 place-items-center">
            <Header />
            <WhyChooseFeatures />
        </div>
    );
};

export default WhyUs;