'use client';
import React from 'react';
import Header from './Header';



const Hero = () => {
  return (
    <>
      <Header />
      <section className="bg-[#FCF9F2] px-6 h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#8BC34A] rounded-full"></div>
        <div className="absolute top-40 right-40 w-24 h-24 bg-gray-400 rounded-full"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-[#8BC34A] rounded-full"></div>
      </div>

      <div className="container mx-auto max-w-4xl text-center relative z-10" style={{ marginTop: '-150px' }}>
        {/* Main Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium text-gray-900 mb-8 leading-tight animate-fade-in" style={{ fontFamily: 'General Sans' }}>
          Turn Your Scrap
          <br />
          <span className="text-gray-900">into Cash with </span>
          <span className="text-[#8BC34A]">sKrapy</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay font-inter font-normal">
          Platform connecting households, businesses & industries with verified vendors for 
          secure, transparent disposal that boosts sustainability and livelihoods.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-2">
          <button className="text-gray-800 px-8 py-4 rounded-lg font-inter font-medium hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl min-w-[160px]" style={{ backgroundColor: '#EBF0DD', border: '1px solid #DFE6D3' }}>
            Our Services
          </button>
          <button className="text-white px-8 py-4 rounded-lg font-inter font-medium hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl min-w-[160px]" style={{ background: 'linear-gradient(to right, white -123%, black 74%)' }}>
            Our Prices
          </button>
        </div>

        
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.3s both;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.6s both;
        }
      `}</style>
    </section>
    </>
  );
};

export default Hero;