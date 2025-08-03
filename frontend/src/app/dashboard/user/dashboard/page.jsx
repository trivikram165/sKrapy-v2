"use client";

import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, Minus, Plus, X, Menu, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import WalletModal from '../../../../components/WalletModal';
import WalletRecommendationModal from '../../../../components/WalletRecommendationModal';

const UserDashboard = () => {
  const { user } = useUser();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [quantities, setQuantities] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isWalletRecommendationOpen, setIsWalletRecommendationOpen] = useState(false);

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  // Handle menu item clicks
  const handleMenuItemClick = (action) => {
    setIsMobileMenuOpen(false);
    if (action === 'orders') {
      router.push('/dashboard/user/orders');
    } else if (action === 'wallet') {
      setIsWalletModalOpen(true);
    }
  };

  // Check wallet recommendation modal
  useEffect(() => {
    if (user) {
      checkWalletRecommendation();
    }
  }, [user]);

  const checkWalletRecommendation = async () => {
    try {
      // Check wallet address
      const walletResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/wallet/${user.id}/user`);
      const walletData = await walletResponse.json();
      
      // Check reminder dismissal status
      const reminderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/wallet-reminder/${user.id}/user`);
      const reminderData = await reminderResponse.json();
      
      const hasWallet = walletData.success && walletData.data && walletData.data.walletAddress;
      const reminderDismissed = reminderData.success && reminderData.data && reminderData.data.walletReminderDismissed;
      
      if (!hasWallet && !reminderDismissed) {
        setIsWalletRecommendationOpen(true);
      }
    } catch (error) {
      console.error('Error checking wallet status:', error);
      // On error, show recommendation as fallback
      setIsWalletRecommendationOpen(true);
    }
  };

  // Listen for wallet modal open event
  useEffect(() => {
    const handleOpenWalletModal = () => {
      setIsWalletModalOpen(true);
    };

    window.addEventListener('openWalletModal', handleOpenWalletModal);
    
    return () => {
      window.removeEventListener('openWalletModal', handleOpenWalletModal);
    };
  }, []);

  const handleWalletClick = () => {
    setIsWalletModalOpen(true);
  };

  const categories = [
    "All",
    "Scrap Collection",
    "Paper Shred",
    "Vehicle Shred",
    "Electronic Waste",
  ];

  const products = [
    // Paper Shredding
    {
      id: 1,
      name: "Office Paper",
      price: 10,
      category: "Paper Shred",
      image: "/api/placeholder/300/200",
    },
    {
      id: 2,
      name: "Newspaper",
      price: 8,
      category: "Paper Shred",
      image: "/api/placeholder/300/200",
    },
    {
      id: 3,
      name: "Cardboard",
      price: 6,
      category: "Paper Shred",
      image: "/api/placeholder/300/200",
    },
    {
      id: 4,
      name: "Magazine",
      price: 7,
      category: "Paper Shred",
      image: "/api/placeholder/300/200",
    },
    {
      id: 5,
      name: "Books",
      price: 9,
      category: "Paper Shred",
      image: "/api/placeholder/300/200",
    },
    {
      id: 6,
      name: "Shredded Paper",
      price: 5,
      category: "Paper Shred",
      image: "/api/placeholder/300/200",
    },
    {
      id: 7,
      name: "Mixed Paper",
      price: 6,
      category: "Paper Shred",
      image: "/api/placeholder/300/200",
    },
    // Vehicle Scrapping
    {
      id: 8,
      name: "Steel",
      price: 90,
      category: "Vehicle Shred",
      image: "/api/placeholder/300/200",
    },
    {
      id: 9,
      name: "Aluminum",
      price: 120,
      category: "Vehicle Shred",
      image: "/api/placeholder/300/200",
    },
    {
      id: 10,
      name: "Rubber",
      price: 45,
      category: "Vehicle Shred",
      image: "/api/placeholder/300/200",
    },
    // Scrap Collection
    {
      id: 11,
      name: "Iron",
      price: 28,
      category: "Scrap Collection",
      image: "/api/placeholder/300/200",
    },
    {
      id: 12,
      name: "Aluminum",
      price: 120,
      category: "Scrap Collection",
      image: "/api/placeholder/300/200",
    },
    {
      id: 13,
      name: "Brass",
      price: 450,
      category: "Scrap Collection",
      image: "/api/placeholder/300/200",
    },
    {
      id: 14,
      name: "Copper",
      price: 700,
      category: "Scrap Collection",
      image: "/api/placeholder/300/200",
    },
    {
      id: 15,
      name: "Steel",
      price: 30,
      category: "Scrap Collection",
      image: "/api/placeholder/300/200",
    },
    {
      id: 16,
      name: "Stainless Steel",
      price: 50,
      category: "Scrap Collection",
      image: "/api/placeholder/300/200",
    },
    {
      id: 17,
      name: "Plastic (Hard)",
      price: 10,
      category: "Scrap Collection",
      image: "/api/placeholder/300/200",
    },
    // Electronic Waste
    {
      id: 18,
      name: "Laptops (Working)",
      price: 1500,
      category: "Electronic Waste",
      unit: "unit",
      image: "/api/placeholder/300/200",
    },
    {
      id: 19,
      name: "Mobile Phones",
      price: 800,
      category: "Electronic Waste",
      unit: "unit",
      image: "/api/placeholder/300/200",
    },
    {
      id: 20,
      name: "Chargers & Cables",
      price: 20,
      category: "Electronic Waste",
      image: "/api/placeholder/300/200",
    },
    {
      id: 21,
      name: "Keyboards & Mice",
      price: 30,
      category: "Electronic Waste",
      image: "/api/placeholder/300/200",
    },
    {
      id: 22,
      name: "Monitors (Flat)",
      price: 300,
      category: "Electronic Waste",
      unit: "unit",
      image: "/api/placeholder/300/200",
    },
    {
      id: 23,
      name: "Old CPUs",
      price: 500,
      category: "Electronic Waste",
      unit: "unit",
      image: "/api/placeholder/300/200",
    },
    {
      id: 24,
      name: "Printers",
      price: 250,
      category: "Electronic Waste",
      unit: "unit",
      image: "/api/placeholder/300/200",
    },
  ];

  const updateQuantity = (productId, change) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 1) + change),
    }));
  };

  const getQuantity = (productId) => quantities[productId] || 1;

  const addToCart = (product) => {
    const quantity = getQuantity(product.id);
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, quantity }]);
    }

    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item,
        ),
      );
    }
  };

  const getTotalAmount = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const getTotalItems = () =>
    cart.reduce((total, item) => total + item.quantity, 0);

  const handleProceedToSell = async () => {
    if (!user) {
      alert('Please sign in to place an order');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          items: cart,
          totalAmount: getTotalAmount(),
          totalItems: getTotalItems()
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Clear cart
        setCart([]);
        setIsCartOpen(false);
        
        // Redirect to orders page
        router.push('/dashboard/user/orders');
      } else {
        // Check if user needs to complete profile
        if (data.redirectTo) {
          alert(data.message);
          router.push(data.redirectTo);
        } else {
          alert(data.message || 'Failed to create order');
        }
      }
    } catch (error) {
      console.error('Order creation error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const footerLinks = {
    About: ["Home", "About Us", "FAQ"],
    Services: [
      "Scrap Collection",
      "Paper Shredding",
      "Vehicle Scrapping",
      "Electronic Waste",
    ],
    Support: ["Contact", "Cart", "Orders"],
    Legal: ["Privacy", "Terms", "Vendors"],
  };

  return (
    <div className="min-h-screen bg-[#F5F3F0] font-geist">
      {/* Header */}
      <header className="px-4 sm:px-6 py-6 sm:py-12 flex items-center justify-between z-50 max-w-7xl mx-auto backdrop-blur-md">
        <Link href="/dashboard/user" className="flex items-center group">
          <img
            src="/icons/orders/left-arrow.png"
            className="w-3 h-3 block group-hover:hidden group-hover:underline"
            alt="arrow"
          />
          <img
            src="/icons/orders/left-arrow-hover.png"
            className="w-3 h-3 hidden group-hover:block group-hover:underline"
            alt="green arrow"
          />
          <span className="ml-1 text-gray-500 group-hover:text-black group-hover:underline text-sm sm:text-base">
            Back to Home
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-3 gap-4">
          <Link href="/dashboard/user/orders">
            <button className="bg-gradient-to-r from-gray-700 to-black text-white px-5 py-2 font-geist rounded-full text-sm font-medium hover:from-gray-600 hover:to-gray-900 transition duration-300">
              Your Orders
            </button>
          </Link>
          <button onClick={handleWalletClick} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <img
              src="/icons/wallet.svg"
              alt="Wallet Icon"
              width={40}
              height={40}
            />
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition duration-300"
          >
            <ShoppingCart className="w-8 h-8 text-gray-700" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#8BC34A] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </button>
          <UserButton />
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center space-x-3">
          {/* Cart button always visible on mobile */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition duration-300"
          >
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#8BC34A] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {getTotalItems()}
              </span>
            )}
          </button>
          
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="p-2 hover:bg-gray-100 rounded-full transition duration-300 flex items-center"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu - Outside header for better positioning */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-white/5 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="fixed top-20 right-4 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 lg:hidden">
            <button
              onClick={() => handleMenuItemClick('orders')}
              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
            >
              <span className="mr-3">📋</span>
              Your Orders
            </button>
            
            <button 
              onClick={() => handleMenuItemClick('wallet')}
              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
            >
              <span className="mr-3">💳</span>
              Wallet
            </button>
            
            <div className="border-t border-gray-100 my-1"></div>
            
            <div className="px-4 py-3">
              <div className="flex items-center justify-end">
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                      userButtonTrigger: "focus:shadow-none hover:shadow-none",
                      userButtonPopoverCard: "z-[70]"
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile menu overlay - Keep this for other functionality if needed */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main */}
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-12">
        <div className="text-left font-geist font-bold mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-gray-900">
            Sell your scrap.
          </h1>
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-[#8BC34A]">
            Find the best vendor.
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-center lg:justify-start">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base ${
                  activeCategory === category
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 pr-4 py-2 sm:py-3 bg-white rounded-lg border text-black border-gray-200 focus:outline-none focus:border-[#8BC34A] transition-colors duration-300 w-full lg:w-80 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-20">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 opacity-0 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-full h-36 sm:h-48 bg-gray-200 rounded-xl mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 opacity-50"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-gray-300 rounded-xl"></div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  {product.name}
                </h3>
                <span className="text-[#8BC34A] font-bold text-base sm:text-lg">
                  ₹{product.price}/{product.unit || "kg"}
                </span>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button
                    onClick={() => updateQuantity(product.id, -1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-300"
                  >
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  </button>
                  <span className="font-medium text-gray-900 min-w-[2rem] text-center text-sm sm:text-base">
                    {getQuantity(product.id)}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-300"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  </button>
                </div>
                <span className="text-gray-500 font-medium text-sm sm:text-base">
                  ₹{product.price * getQuantity(product.id)}
                </span>
              </div>

              <button
                onClick={() => addToCart(product)}
                className="w-full bg-[#8BC34A] text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-[#7CB342] transition-colors duration-300 text-sm sm:text-base"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Your cart is empty</p>
                <p className="text-gray-400 text-sm">
                  Add some items to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-300 border"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="font-medium text-gray-900 min-w-[2rem] text-center">
                          {item.quantity}{item.unit || "kg"}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-300 border"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          ₹{item.price}/{item.unit || "kg"}
                        </p>
                        <p className="font-bold text-[#8BC34A]">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-gray-200 p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{getTotalItems()}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-900">
                    Total Amount:
                  </span>
                  <span className="text-2xl font-bold text-[#8BC34A]">
                    ₹{getTotalAmount()}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  You will receive this amount when you sell your scrap
                </p>
              </div>
              <button 
                onClick={handleProceedToSell}
                disabled={isSubmittingOrder}
                className="w-full bg-[#8BC34A] text-white py-3 rounded-lg font-medium hover:bg-[#7CB342] transition-colors duration-300 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingOrder ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Order...
                  </div>
                ) : (
                  'Proceed to Sell'
                )}
              </button>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-300"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-[#F5F3F0] py-16 px-6 border-t border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="font-bold text-gray-900 mb-4">{category}</h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-gray-600 hover:text-[#8BC34A] transition-colors duration-300"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </footer>

      {/* Animation style */}
      <style jsx>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fade-up 0.6s ease-out both;
        }
      `}</style>

      {/* Wallet Modal */}
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
        userType="user"
      />

      {/* Wallet Recommendation Modal */}
      <WalletRecommendationModal
        isOpen={isWalletRecommendationOpen}
        onClose={() => setIsWalletRecommendationOpen(false)}
        userType="user"
      />
    </div>
  );
};

export default UserDashboard;
