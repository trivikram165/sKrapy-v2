import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#F5F3F0] py-10 px-6 md:px-20 text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        
        {/* Left Section - Logo and Tagline */}
        <div className="flex items-start gap-4">
          <img src="logo/logo2.svg" alt="sKrapy logo" className="w-12 h-12" />
          <p className="max-w-xs text-md">
            Revolutionizing India’s scrap collection ecosystem for a cleaner, greener future.
          </p>
        </div>

        {/* Right Section - Contact Info */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Get in Touch</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={16} /> +91 XXXXXXXXXX
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} /> <a href="mailto:support@skrapy.com" className="hover:underline">support@skrapy.com</a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} /> Mumbai, Maharashtra, India
            </li>
            <li className="flex items-center gap-2">
              <Clock size={16} /> Mon–Sat: 9:00AM – 6:00PM IST
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
