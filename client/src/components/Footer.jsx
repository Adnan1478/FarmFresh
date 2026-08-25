import React from "react";
import { Link } from "react-router-dom";
import { Leaf, ShieldCheck, Truck, Clock, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-24 md:pb-12 mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features / Why Choose Us Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-10 border-b border-slate-800 text-slate-200">
          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-2xl">
            <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Fast Delivery</h4>
              <p className="text-xs text-slate-400">Within 2 hours in your area</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-2xl">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">100% Organic</h4>
              <p className="text-xs text-slate-400">Directly from verified farms</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-2xl">
            <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Best Quality & Price</h4>
              <p className="text-xs text-slate-400">Affordable daily grocery rates</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-2xl">
            <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">24/7 Customer Support</h4>
              <p className="text-xs text-slate-400">Dedicated assistance anytime</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          {/* Brand Info */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white">
                <Leaf className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Farm<span className="text-green-500">Fresh</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              FarmFresh brings healthy, farm-harvested vegetables, juicy seasonal fruits, and natural produce directly to your kitchen.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-green-500 shrink-0" />
              <span>Plot 42, Green Valley Estate, Mumbai, MH</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/products?category=vegetables" className="hover:text-green-400 transition-colors">Fresh Vegetables</Link></li>
              <li><Link to="/products?category=fruits" className="hover:text-green-400 transition-colors">Organic Fruits</Link></li>
              <li><Link to="/products?category=juices" className="hover:text-green-400 transition-colors">Cold-Pressed Juices</Link></li>
              <li><Link to="/products?category=dried" className="hover:text-green-400 transition-colors">Dried Fruits & Nuts</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Company & Help</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/about" className="hover:text-green-400 transition-colors">About Us & Organic Mission</Link></li>
              <li><Link to="/contact" className="hover:text-green-400 transition-colors">Contact Support & FAQs</Link></li>
              <li><Link to="/orders" className="hover:text-green-400 transition-colors">Track My Order</Link></li>
              <li><Link to="/cart" className="hover:text-green-400 transition-colors">My Shopping Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-green-400 transition-colors">My Wishlist</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-emerald-400 transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact Us</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-500" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-500" />
                <span>support@farmfresh.com</span>
              </div>
              <div className="pt-2">
                <div className="text-[11px] text-slate-400 mb-2">Accepted Payment Modes</div>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px] font-bold">UPI</span>
                  <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px] font-bold">CARDS</span>
                  <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px] font-bold">COD</span>
                  <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px] font-bold">NET BANKING</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} FarmFresh Grocery Store. All rights reserved. 100% Organic Farm-Direct Grocery E-Commerce.
        </div>
      </div>
    </footer>
  );
}
