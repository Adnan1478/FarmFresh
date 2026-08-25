import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  MapPin,
  Leaf,
  ChevronDown,
  ShieldCheck,
  PackageCheck,
  User,
  LogOut,
  Info,
  PhoneCall
} from "lucide-react";
import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { cartCount, wishlist, setIsCartOpen } = useShop();
  const { user, isAuthenticated, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs">
      {/* Top bar info banner */}
      <div className="bg-emerald-900 text-white text-xs py-1.5 px-4 font-medium flex items-center justify-between">
        <div className="hidden lg:flex items-center gap-2">
          <span>⚡ Express 2-Hour Delivery in your city!</span>
        </div>
        <div className="mx-auto lg:mx-0 text-center">
          🌱 100% Organic & Farm Fresh Produce Guaranteed | Free Shipping above ₹500
        </div>
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <Link to="/contact" className="text-emerald-200 hover:text-white transition-colors flex items-center gap-1 font-semibold">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Support</span>
          </Link>
          <Link to="/admin/dashboard" className="text-emerald-200 hover:text-white transition-colors flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>

      {/* Main Navbar Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Leaf className="w-6 h-6 fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
                Farm<span className="text-green-600">Fresh</span>
              </span>
              <span className="hidden sm:block text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">
                Organic Grocery
              </span>
            </div>
          </Link>

          {/* Location Picker Badge (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs shrink-0">
            <MapPin className="w-4 h-4 text-green-600 shrink-0" />
            <div>
              <div className="text-[9px] text-slate-400 font-semibold uppercase">Deliver to</div>
              <div className="font-bold text-slate-800 flex items-center gap-1">
                <span>Mumbai 400001</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <SearchBar />
          </div>

          {/* User & Cart Quick Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Real-Time Notification Bell */}
            <NotificationBell />

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-600 hover:text-red-500 hover:bg-slate-50 rounded-xl transition-all"
              title="My Wishlist"
            >
              <Heart className="w-6 h-6" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulseSubtle">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Icon & Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-800 px-3.5 py-2 rounded-xl transition-all border border-green-200"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-green-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold text-xs">Cart</span>
            </button>

            {/* Login Button or Account User Dropdown */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{user?.name?.[0]?.toUpperCase() || "U"}</span>
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block pr-1" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-slideDown">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                    >
                      <PackageCheck className="w-4 h-4 text-slate-500" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                    >
                      <Heart className="w-4 h-4 text-slate-500" />
                      <span>My Wishlist ({wishlist.length})</span>
                    </Link>

                    {user?.role === "admin" && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 font-semibold transition-colors border-t border-slate-100"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Admin Control Panel</span>
                      </Link>
                    )}

                    {user?.role === "vendor" && (
                      <Link
                        to="/vendor/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 font-semibold transition-colors border-t border-slate-100"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Vendor Farm Portal 🚜</span>
                      </Link>
                    )}

                    {user?.role === "deliveryboy" && (
                      <Link
                        to="/delivery/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-700 hover:bg-blue-50 font-semibold transition-colors border-t border-slate-100"
                      >
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>Delivery Agent Portal 🚚</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-semibold transition-colors border-t border-slate-100 text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search input bar */}
        <div className="md:hidden">
          <SearchBar placeholder="Search 100+ fresh items..." />
        </div>

        {/* Secondary Nav Category Bar */}
        <nav className="pt-2 border-t border-slate-100 hidden md:flex items-center justify-between text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-6 overflow-x-auto py-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `hover:text-green-600 transition-colors whitespace-nowrap ${
                  isActive ? "text-green-600 font-bold" : ""
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/products?category=vegetables"
              className={({ isActive }) =>
                `hover:text-green-600 transition-colors whitespace-nowrap flex items-center gap-1 ${
                  isActive ? "text-green-600 font-bold" : ""
                }`
              }
            >
              🥕 Vegetables
            </NavLink>
            <NavLink
              to="/products?category=fruits"
              className={({ isActive }) =>
                `hover:text-green-600 transition-colors whitespace-nowrap flex items-center gap-1 ${
                  isActive ? "text-green-600 font-bold" : ""
                }`
              }
            >
              🍎 Fruits
            </NavLink>
            <NavLink
              to="/products?category=juices"
              className={({ isActive }) =>
                `hover:text-green-600 transition-colors whitespace-nowrap flex items-center gap-1 ${
                  isActive ? "text-green-600 font-bold" : ""
                }`
              }
            >
              🧃 Fresh Juices
            </NavLink>
            <NavLink
              to="/products?category=dried"
              className={({ isActive }) =>
                `hover:text-green-600 transition-colors whitespace-nowrap flex items-center gap-1 ${
                  isActive ? "text-green-600 font-bold" : ""
                }`
              }
            >
              🌰 Dried & Nuts
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `hover:text-green-600 transition-colors whitespace-nowrap ${
                  isActive ? "text-green-600 font-bold" : ""
                }`
              }
            >
              About Us
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `hover:text-green-600 transition-colors whitespace-nowrap ${
                  isActive ? "text-green-600 font-bold" : ""
                }`
              }
            >
              Contact Us
            </NavLink>
          </div>

          <div className="text-slate-400 font-normal shrink-0">
            Need help? <span className="font-semibold text-slate-700">+91 98765 43210</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
