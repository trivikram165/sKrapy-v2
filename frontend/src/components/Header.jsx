import React, { useState } from 'react';
import Image from 'next/image';
import UserTypeModal from './UserTypeModal';

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGetStartedClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  return (
    <header className="w-full sticky top-0 z-50">
      {/* Blurred top section */}
      <div className="w-full px-6 pt-3 backdrop-blur-md bg-[#FCF9F2]/50">
        <div className="w-full max-w-7xl mx-auto">
          <div className="h-4"></div> {/* Spacer for blur area */}
        </div>
      </div>
      
      {/* Main navbar section without blur */}
      <div className="w-full px-6 bg-[#FCF9F2]">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between bg-white rounded-2xl shadow-sm px-6 py-3">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Image src="/logo/logo1.svg" alt="Logo" width={100} height={100} priority />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-10 font-medium text-gray-800">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#7CB342] transition-colors">Home</button>
            <button onClick={() => scrollToSection('prices')} className="hover:text-[#7CB342] transition-colors">Our Prices</button>
            <button onClick={() => scrollToSection('services')} className="hover:text-[#7CB342] transition-colors">How We Work</button>
            <button onClick={() => scrollToSection('why-us')} className="hover:text-[#7CB342] transition-colors">Why Us</button>
          </nav>

          {/* Button */}
          <button 
            onClick={handleGetStartedClick}
            className="text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-all" 
            style={{ background: 'linear-gradient(to right, white -123%, black 74%)' }}
          >
            Get Started
          </button>
        </div>
      </div>

      {/* User Type Modal */}
      <UserTypeModal isOpen={isModalOpen} onClose={closeModal} />
    </header>
  );
};

export default Header;