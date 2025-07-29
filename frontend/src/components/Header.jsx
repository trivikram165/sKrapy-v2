import React from 'react';
import Image from 'next/image';
// import logo from '../logo/logo1.svg'; // adjust path if needed

const Header = () => {
  return (
    <header className="w-full px-6 py-3 sticky top-0 z-50 flex justify-center bg-[#FCF9F2]">
      <div className="w-full max-w-7xl flex items-center justify-between bg-white rounded-2xl shadow-sm px-6 py-3">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image src="../logo/logo1.svg" alt="Logo" width={100} height={100} priority />

        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-10 font-medium text-gray-800">
          <a href="#home" className="hover:text-[#7CB342] transition-colors">Home</a>
          <a href="#prices" className="hover:text-[#7CB342] transition-colors">Our Prices</a>
          <a href="#services" className="hover:text-[#7CB342] transition-colors">Services</a>
          <a href="#why-us" className="hover:text-[#7CB342] transition-colors">Why Us</a>
        </nav>

        {/* Button */}
        <button className="bg-gradient-to-r from-gray-900 to-black text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-all">
          Get Started
        </button>
      </div>
    </header>
  );
};

export default Header;