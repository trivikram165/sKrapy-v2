"use client";

import React, { useEffect, useRef, useState } from "react";
import { textAnimateLoop } from "./WhyUs";

const paperMaterials = [
  { material: "Office Paper", price: "₹10/kg" },
  { material: "Newspaper", price: "₹8/kg" },
  { material: "Cardboard", price: "₹6/kg" },
  { material: "Magazine", price: "₹7/kg" },
  { material: "Books", price: "₹9/kg" },
  { material: "Shredded Paper", price: "₹5/kg" },
  { material: "Mixed Paper", price: "₹6/kg" },
];

const vehicleMaterials = [
  { material: "steel", price: "₹90/kg" },
  { material: "aluminum", price: "₹120/kg" },
  { material: "rubber", price: "₹45/kg" },
];

const scrapMaterials = [
  { material: "Iron", price: "₹28/kg" },
  { material: "Aluminum", price: "₹120/kg" },
  { material: "Brass", price: "₹450/kg" },
  { material: "Copper", price: "₹700/kg" },
  { material: "Steel", price: "₹30/kg" },
  { material: "Stainless Steel", price: "₹50/kg" },
  { material: "Plastic (Hard)", price: "₹10/kg" },
];

const electronicMaterials = [
  { material: "Laptops (Working)", price: "₹1500/unit" },
  { material: "Mobile Phones", price: "₹800/unit" },
  { material: "Chargers & Cables", price: "₹20/kg" },
  { material: "Keyboards & Mice", price: "₹30/kg" },
  { material: "Monitors (Flat)", price: "₹300/unit" },
  { material: "Old CPUs", price: "₹500/unit" },
  { material: "Printers", price: "₹250/unit" },
];



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

  const [parallaxRef, scrollY] = useParallaxScroll(0.3);
  const [loadRef, isVisible] = useLoadAnimation();

  const phrase = ["Current", "Scrap", "Prices"];
  const [visibleWords, setVisibleWords] = useState([]);
  const [showSubtext, setShowSubtext] = useState(false);

  useEffect(() => {
      textAnimateLoop(isVisible, phrase, setVisibleWords, setShowSubtext);
  }, [isVisible]);

  return (
    <div ref={loadRef} className='text-center mb-12'>
      <div className='inline-flex items-center bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm mb-6 font-geist shadow-lg border border-gray-700'>
        <div className='w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse'></div>
        Our prices
      </div>
      <h1 ref={parallaxRef} className='text-5xl font-medium text-gray-900 mb-4 font-geist'>
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
      </h1>
      <p ref={parallaxRef} className={`text-gray-500 text-lg font-geist 
          ${showSubtext ? "opacity-100 scale-100 animate-fade-in-delay" : "opacity-0 scale-95"}`}>
        Real-time pricing tied to global market indices
      </p>
    </div>
  );
};

// Paper Shredding Component
const PaperShredding = () => {
  const [parallaxRef, scrollY] = useParallaxScroll(0.3);
  const [loadRef, isVisible] = useLoadAnimation();
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setIsOpen(true);
    setTimeout(() => setShowModal(true), 10);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  return (
    <>
      <div
        // onClick={() => setIsOpen(true)}
        onClick={openModal}
        ref={loadRef}
        className={`cursor-pointer rounded-3xl grid grid-cols-2 p-8 h-80 relative overflow-hidden shadow-lg transition-all duration-1000 ease-out ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-8"
        }`}
        style={{ backgroundColor: '#A9DD66' }}
      >
        <div className='relative z-10 flex flex-col justify-center h-full left-4 sm:-mt-5'>
          <h2 className='text-3xl font-black text-gray-800 mb-4 font-satoshi'>
            Paper Shredding
          </h2>
          <p className='text-gray-700 text-med leading-tight max-w-xs font-satoshi'>
            Track real-time prices, schedule pickups,
            <br />
            and earn instantly securely and sustainably.
          </p>
        </div>

        <div
          ref={parallaxRef}
          className='w-full h-full flex items-center justify-center sm:-mt-5 sm:ml-5'
          style={{
            transform: `translateY(${scrollY}px) rotate(-15deg)`,
            filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.3))",
          }}
        >
          <img
            src='prices/printer.png'
            alt='Paper Shredder'
            className='w-full sm:w-72 object-contain rounded-xl'
          />
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
          <div
            className={`
              bg-white rounded-3xl w-[90%] max-w-xl max-h-[90vh] overflow-hidden shadow-2xl relative
              transform transition-all duration-300
              ${showModal ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
            `}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-3xl font-extrabold text-gray-800 font-satoshi">Paper Shredding</h2>
              <button
                onClick={closeModal}
                className="bg-black rounded-full p-2 hover:bg-[#9DCC5E] transition"
              >
                <img src="/icons/orders/x-white.png" alt="Close" className="w-3 h-3" />
              </button>
            </div>

            {/* Popup Table */}
            <div className="p-6 pt-3 overflow-y-auto max-h-[60vh]">
              <table className="w-full table-auto text-left border-collapse">
                <colgroup>
                  <col style={{ width: "75%" }} />
                  <col style={{ width: "25%" }} />
                </colgroup>
                <thead>
                  <tr className="bg-[#AADD66] text-white rounded-lg text-xl">
                    <th className="p-3 rounded-l-lg">Materials</th>
                    <th className="p-3 rounded-r-lg text-center border-l border-gray-200">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {paperMaterials.map((item, index) => (
                    <tr key={index} className="bg-white hover:bg-gray-100">
                      <td className="p-3 text-gray-800 capitalize font-medium">{item.material}</td>
                      <td className="p-3 text-gray-800 text-center border-l border-gray-200">{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Vehicle Scrapping Component
const VehicleScrapping = () => {
  const [parallaxRef, scrollY] = useParallaxScroll(-0.4);
  const [loadRef, isVisible] = useLoadAnimation();
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setIsOpen(true);
    setTimeout(() => setShowModal(true), 10);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  return (
    <>
      <div
        onClick={openModal}
        ref={loadRef}
        className={`cursor-pointer rounded-3xl p-8 h-80 relative overflow-hidden shadow-lg transition-all duration-1000 ease-out ${
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

        <div
          ref={parallaxRef}
          className='absolute left-1/2 top-32 w-72 h-72'
          style={{
            transform: `translate(-50%, 0) translateY(${scrollY}px)`,
            filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.5))",
          }}
        >
          <img
            src="prices/rim.png"
            alt="Car Wheel"
            className="w-full h-full object-contain rounded-full"
          />
        </div>
      </div>

      {/* Popup */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300">
          <div
            className={`
              bg-white rounded-3xl w-[90%] max-w-xl max-h-[90vh] overflow-hidden shadow-2xl relative
              transform transition-all duration-300
              ${showModal ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
            `}
          >
            <div className="flex justify-between items-center p-6 pb-0">
              <h3 className="text-3xl text-black font-bold font-satoshi">Vehicle Scrapping</h3>
              <button
                onClick={closeModal}
                className="rounded-full bg-black p-2 hover:bg-[#9DCC5E]"
              >
                <img src="/icons/orders/x-white.png" alt="Close" className="w-3 h-3" />
              </button>
            </div>

            <div className="p-6 pt-3 overflow-y-auto max-h-[60vh]">
              <table className="w-full table-auto text-left border-collapse">
                <colgroup>
                  <col style={{ width: "75%" }} />
                  <col style={{ width: "25%" }} />
                </colgroup>
                <thead>
                  <tr className="bg-[#AADD66] text-white text-xl">
                    <th className="p-3 rounded-l-lg">Materials</th>
                    <th className="p-3 rounded-r-lg text-center border-l border-gray-200">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleMaterials.map((item, index) => (
                    <tr key={index} className="bg-white hover:bg-gray-100">
                      <td className="p-3 text-gray-800 capitalize">{item.material}</td>
                      <td className="p-3 text-gray-800 text-center border-l-2 border-gray-200">{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Scrap Collection Component
const ScrapCollection = () => {
  const [parallaxRef, scrollY] = useParallaxScroll(0.5);
  const [loadRef, isVisible] = useLoadAnimation();
  const [isOpen, setIsOpen] = useState(false)
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setIsOpen(true);
    setTimeout(() => setShowModal(true), 10);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  return (
    <>
      <div
        onClick={openModal}
        ref={loadRef}
        className={`cursor-pointer bg-white rounded-3xl p-8 h-80 border border-gray-200 relative overflow-hidden shadow-lg transition-all duration-1000 ease-out ${
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

      {/* Popup */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300">
          <div
            className={`
              bg-white rounded-3xl w-[90%] max-w-xl max-h-[90vh] overflow-hidden shadow-2xl relative
              transform transition-all duration-300
              ${showModal ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
            `}
          >
            <div className="flex justify-between items-center p-6 pb-0">
              <h3 className="text-3xl text-black font-bold font-satoshi"> Scrap Collection </h3>
              <button
                onClick={closeModal}
                className="rounded-full bg-black p-2 hover:bg-[#9DCC5E]"
              >
                <img src="/icons/orders/x-white.png" alt="Close" className="w-3 h-3" />
              </button>
            </div>

            <div className="p-6 pt-3 overflow-y-auto max-h-[60vh]">
              <table className="w-full table-auto text-left border-collapse">
                <colgroup>
                  <col style={{ width: "75%" }} />
                  <col style={{ width: "25%" }} />
                </colgroup>
                <thead>
                  <tr className="bg-[#AADD66] text-white text-xl">
                    <th className="p-3 rounded-l-lg">Materials</th>
                    <th className="p-3 rounded-r-lg text-center border-l border-gray-200">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {scrapMaterials.map((item, index) => (
                    <tr key={index} className="bg-white hover:bg-gray-100">
                      <td className="p-3 text-gray-800 capitalize">{item.material}</td>
                      <td className="p-3 text-gray-800 text-center border-l-2 border-gray-200">{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Electronic Waste Component
const ElectronicWaste = () => {
  const [parallaxRef, scrollY] = useParallaxScroll(-0.3);
  const [loadRef, isVisible] = useLoadAnimation();
  const [isOpen, setIsOpen] = useState(false)
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setIsOpen(true);
    setTimeout(() => setShowModal(true), 10);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  return (
    <>
      <div
        onClick={openModal}
        ref={loadRef}
        className={`cursor-pointer rounded-3xl grid[grid-template-rows:2fr_1fr] p-8 h-80 relative overflow-hidden shadow-lg transition-all duration-1000 ease-out ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-8"
        }`}
        style={{ backgroundColor: '#C0ECFF' }}
      >
        <div className='relative z-10 flex'>
          <div className='flex items-start flex-col sm:flex-row gap-16'>
            <h2 className='text-4xl font-black text-gray-800 font-satoshi'>
              Electronic Waste
            </h2>
            <p className='text-gray-700 text-med leading-tight font-satoshi sm:mt-0 -mt-12 ml-1'>
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
          className='w-108 h-108 -ml-12 sm:ml-30 '
          style={{
            transform: `sm:translate(0, 50%) translateY(${scrollY}px)`,
            filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.25))",
          }}
        >
          <img
            src='prices/circuit.png'
            alt='Circuit Board'
            className='sm:w-7xl sm:h-full object-contain rounded-lg'
          />
        </div>
      </div>

      {/* Popup */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300">
          <div
            className={`
              bg-white rounded-3xl w-[90%] max-w-xl max-h-[90vh] overflow-hidden shadow-2xl relative
              transform transition-all duration-300
              ${showModal ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
            `}
          >
            <div className="flex justify-between items-center p-6 pb-0">
              <h3 className="text-3xl text-black font-bold font-satoshi"> Electronic Waste </h3>
              <button
                onClick={closeModal}
                className="rounded-full bg-black p-2 hover:bg-[#9DCC5E]"
              >
                <img src="/icons/orders/x-white.png" alt="Close" className="w-3 h-3" />
              </button>
            </div>

            <div className="p-6 pt-3 overflow-y-auto max-h-[60vh]">
              <table className="w-full table-auto text-left border-collapse">
                <colgroup>
                  <col style={{ width: "75%" }} />
                  <col style={{ width: "25%" }} />
                </colgroup>
                <thead>
                  <tr className="bg-[#AADD66] text-white text-xl">
                    <th className="p-3 rounded-l-lg"> Materials </th>
                    <th className="p-3 rounded-r-lg text-center border-l border-gray-200"> Price </th>
                  </tr>
                </thead>
                <tbody>
                  {electronicMaterials.map((item, index) => (
                    <tr key={index} className="bg-white hover:bg-gray-100">
                      <td className="p-3 text-gray-800 capitalize"> {item.material} </td>
                      <td className="p-3 text-gray-800 text-center border-l-2 border-gray-200"> {item.price} </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </>
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
export { useParallaxScroll, useLoadAnimation };