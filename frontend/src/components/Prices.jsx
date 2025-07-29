"use client";

import React, { useEffect, useRef, useState } from "react";

// Custom hook for parallax scroll effect
const useParallaxScroll = (speed = 0.5) => {
  const [scrollY, setScrollY] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrollProgress =
          (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        setScrollY(scrollProgress * 100 * speed);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [speed]);

  return [ref, scrollY];
};

// Custom hook for load animation
const useLoadAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [ref, isVisible];
};

// Header Component
const Header = () => {
  return (
    <div className='text-center mb-12'>
      <div className='inline-flex items-center bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm mb-6 font-geist shadow-lg border border-gray-700'>
        <div className='w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse'></div>
        Our prices
      </div>
      <h1 className='text-5xl font-medium text-gray-900 mb-4 font-geist'>
        Current Scrap Prices
      </h1>
      <p className='text-gray-500 text-lg font-geist'>
        Real-time pricing tied to global market indices
      </p>
    </div>
  );
};

// Paper Shredding Component
const PaperShredding = () => {
  const [parallaxRef, scrollY] = useParallaxScroll(0.3);
  const [loadRef, isVisible] = useLoadAnimation();

  return (
    <div
      ref={loadRef}
      className={`rounded-3xl p-8 h-80 relative overflow-hidden shadow-lg transition-all duration-1000 ease-out ${
        isVisible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 translate-y-8"
      }`}
      style={{ backgroundColor: '#A9DD66' }}
    >
      <div className='relative z-10 flex flex-col justify-center h-full left-4'>
        <h2 className='text-3xl font-black text-gray-800 mb-4 font-satoshi'>
          Paper Shredding
        </h2>
        <p className='text-gray-700 text-med leading-tight max-w-xs font-satoshi'>
          Track real-time prices, schedule pickups,
          <br />
          and earn instantly securely and sustainably.
        </p>
      </div>

      {/* Paper Shredding Image */}
      <div
        ref={parallaxRef}
        className='absolute right-6 bottom-6 w-72 h-72 top-1/2'
        style={{
          transform: `translate(0, -50%) translateY(${scrollY}px) rotate(-15deg)`,
          filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.3))",
        }}
      >
        <img
          src='prices/printer.png'
          alt='Paper Shredder'
          className='w-full h-full object-contain rounded-xl'
        />
      </div>
    </div>
  );
};

// Vehicle Scrapping Component
const VehicleScrapping = () => {
  const [parallaxRef, scrollY] = useParallaxScroll(-0.4);
  const [loadRef, isVisible] = useLoadAnimation();

  return (
    <div
      ref={loadRef}
      className={`rounded-3xl p-8 h-80 relative overflow-hidden shadow-lg transition-all duration-1000 ease-out ${
        isVisible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 translate-y-8"
      }`}
      style={{ backgroundColor: '#213046' }}
    >
      <div className='relative z-10 text-center'>
        <h2 className='text-3xl font-black text-white leading-tight font-satoshi'>
          Vehicle
          <br />
          Scrapping
        </h2>
      </div>

      {/* Vehicle Wheel Image */}
      <div
        ref={parallaxRef}
        className='absolute left-1/2 top-32 w-72 h-72'
        style={{
          transform: `translate(-50%, 0) translateY(${scrollY}px)`,
          filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.5))",
        }}
      >
        <img src="prices/rim.png" alt="Car Wheel" className="w-full h-full object-contain rounded-full" />
      </div>
    </div>
  );
};

// Scrap Collection Component
const ScrapCollection = () => {
  const [parallaxRef, scrollY] = useParallaxScroll(0.5);
  const [loadRef, isVisible] = useLoadAnimation();

  return (
    <div
      ref={loadRef}
      className={`bg-white rounded-3xl p-8 h-80 border border-gray-200 relative overflow-hidden shadow-lg transition-all duration-1000 ease-out ${
        isVisible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 translate-y-8"
      }`}
    >
      <div className='relative z-10 text-center'>
        <h2 className='text-3xl font-black text-gray-800 leading-tight font-satoshi'>
          Scrap
          <br />
          Collection
        </h2>
      </div>

      {/* Metal Coils/Wires Image */}
      <div
        ref={parallaxRef}
        className='absolute left-1/2 top-3/4 w-96 h-96'
        style={{
          transform: `translate(-50%, -50%) translateY(${scrollY}px)`,
          filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.2))",
        }}
      >
        <img src="prices/wires.png" alt="Metal Coils" className="w-full h-full object-contain rounded-lg" />
      </div>
    </div>
  );
};

// Electronic Waste Component
const ElectronicWaste = () => {
  const [parallaxRef, scrollY] = useParallaxScroll(-0.3);
  const [loadRef, isVisible] = useLoadAnimation();

  return (
    <div
      ref={loadRef}
      className={`rounded-3xl p-8 h-80 relative overflow-hidden shadow-lg transition-all duration-1000 ease-out ${
        isVisible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 translate-y-8"
      }`}
      style={{ backgroundColor: '#C0ECFF' }}
    >
      <div className='relative z-10 flex items-center justify-center text-left'>
        <div className='flex items-start gap-16'>
          <h2 className='text-4xl font-black text-gray-800 font-satoshi'>
            Electronic Waste
          </h2>
          <p className='text-gray-700 text-med leading-tight font-satoshi'>
            Verified vendors, global price-linked
            <br />
            payouts, and doorstep service turn
            <br />
            scrap into value.
          </p>
        </div>
      </div>

      {/* Circuit Board Image */}
      <div
        ref={parallaxRef}
        className='absolute right-6 w-108 h-108 bottom-0'
        style={{
          transform: `translate(0, 50%) translateY(${scrollY}px)`,
          filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.25))",
        }}
      >
        <img
          src='prices/circuit.png'
          alt='Circuit Board'
          className='w-full h-full object-contain rounded-lg'
        />
      </div>
    </div>
  );
};

// Main Page Component
const ScrapPricingPage = () => {
  return (
    <div className='min-h-screen bg-[#FCF9F2] py-16 px-4'>
      <div className='max-w-6xl mx-auto'>
        <Header />

        {/* Grid layout matching the original image */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Paper Shredding - spans 2 columns */}
          <div className='lg:col-span-2'>
            <PaperShredding />
          </div>

          {/* Vehicle Scrapping - spans 1 column */}
          <div className='lg:col-span-1'>
            <VehicleScrapping />
          </div>

          {/* Scrap Collection - spans 1 column */}
          <div className='lg:col-span-1'>
            <ScrapCollection />
          </div>

          {/* Electronic Waste - spans 2 columns */}
          <div className='lg:col-span-2'>
            <ElectronicWaste />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrapPricingPage;
