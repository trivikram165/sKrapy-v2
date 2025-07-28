import React from 'react';

const Header = () => {
  return (
    <header className="bg-[#E5E1DC] py-4 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-sm bg-opacity-95 transition-all duration-300">
      {/* Logo */}
      <div className="flex items-center space-x-6">
        <img src="logo/logo1.svg" alt="sKrapy logo" className="w-21 h-16" />
       
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center space-x-8">
        <a href="#home" className="text-gray-700 hover:text-[#8BC34A] transition-colors duration-300 font-medium">Home</a>
        <a href="#prices" className="text-gray-700 hover:text-[#8BC34A] transition-colors duration-300 font-medium">Our Prices</a>
        <a href="#services" className="text-gray-700 hover:text-[#8BC34A] transition-colors duration-300 font-medium">Services</a>
        <a href="#why-us" className="text-gray-700 hover:text-[#8BC34A] transition-colors duration-300 font-medium">Why Us</a>
      </nav>

      {/* Get Started Button */}
      <button className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
        Get Started
      </button>
    </header>
  );
};

export default Header;