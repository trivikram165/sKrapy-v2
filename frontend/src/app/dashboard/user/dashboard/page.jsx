"use client";

import React, { useState } from "react";
import { Search, ShoppingCart, Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const UserDashboard = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [quantities, setQuantities] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const categories = [
    "All",
    "Scrap Collection",
    "Paper Shred",
    "Vehicle Shred",
    "Electronic Waste",
  ];

  const products = [
    {
      id: 1,
      name: "Metal",
      price: 200,
      category: "Scrap Collection",
      image: "/api/placeholder/300/200",
    },
    {
      id: 2,
      name: "Metal",
      price: 200,
      category: "Scrap Collection",
      image: "/api/placeholder/300/200",
    },
    {
      id: 3,
      name: "Metal",
      price: 200,
      category: "Scrap Collection",
      image: "/api/placeholder/300/200",
    },
    {
      id: 4,
      name: "Metal",
      price: 200,
      category: "Scrap Collection",
      image: "/api/placeholder/300/200",
    },
    {
      id: 5,
      name: "Metal",
      price: 200,
      category: "Scrap Collection",
      image: "/api/placeholder/300/200",
    },
    {
      id: 6,
      name: "Clothes",
      price: 200,
      category: "Scrap Collection",
      image: "/api/placeholder/300/200",
    },
    {
      id: 7,
      name: "Newspaper",
      price: 200,
      category: "Paper Shred",
      image: "/api/placeholder/300/200",
    },
    {
      id: 8,
      name: "Spare Parts",
      price: 200,
      category: "Vehicle Shred",
      image: "/api/placeholder/300/200",
    },
    {
      id: 9,
      name: "Electronics",
      price: 400,
      category: "Electronic Waste",
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
      <header className="px-6 py-12 flex items-center justify-between z-50 max-w-7xl mx-auto backdrop-blur-md">
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
          <span className="ml-1 text-gray-500 group-hover:text-black group-hover:underline">
            Back to Home
          </span>
        </Link>
        <div className="flex items-center space-x-3 gap-4">
          <button className="bg-gradient-to-r from-gray-700 to-black text-white px-5 py-2 font-geist rounded-full text-sm font-medium hover:from-gray-600 hover:to-gray-900 transition duration-300">
            Your Orders
          </button>
          <button>
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
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto max-w-7xl px-6 py-12">
        <div className="text-left font-geist font-bold mb-12">
          <h1 className="text-5xl md:text-5xl text-gray-900">
            Sell your scrap.
          </h1>
          <h2 className="text-5xl md:text-5xl text-[#8BC34A]">
            Find the best vendor.
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeCategory === category
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#8BC34A] transition-colors duration-300 w-80"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 opacity-0 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-full h-48 bg-gray-200 rounded-xl mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 opacity-50"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-gray-300 rounded-xl"></div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {product.name}
                </h3>
                <span className="text-[#8BC34A] font-bold text-lg">
                  ₹{product.price}/kg
                </span>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(product.id, -1)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-300"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="font-medium text-gray-900 min-w-[2rem] text-center">
                    {getQuantity(product.id)}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, 1)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-300"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <span className="text-gray-500 font-medium">
                  ₹{product.price * getQuantity(product.id)}
                </span>
              </div>

              <button
                onClick={() => addToCart(product)}
                className="w-full bg-[#8BC34A] text-white py-3 rounded-lg font-medium hover:bg-[#7CB342] transition-colors duration-300"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
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
                          {item.quantity}kg
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
                          ₹{item.price}/kg
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
                  <span className="text-gray-600">Total Weight:</span>
                  <span className="font-medium">{getTotalItems()}kg</span>
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
              <button className="w-full bg-[#8BC34A] text-white py-3 rounded-lg font-medium hover:bg-[#7CB342] transition-colors duration-300 mb-3">
                Proceed to Sell
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
    </div>
  );
};

export default UserDashboard;
