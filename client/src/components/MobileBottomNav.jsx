import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Search, Heart, ShoppingBag, User } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";

export default function MobileBottomNav() {
  const { cartCount, wishlist, setIsCartOpen } = useShop();
  const { isAuthenticated } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-3 z-40 shadow-lg flex items-center justify-around">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            isActive ? "text-green-600 font-bold" : "text-slate-500"
          }`
        }
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/products"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            isActive ? "text-green-600 font-bold" : "text-slate-500"
          }`
        }
      >
        <Search className="w-5 h-5" />
        <span>Browse</span>
      </NavLink>

      <NavLink
        to="/wishlist"
        className={({ isActive }) =>
          `relative flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            isActive ? "text-green-600 font-bold" : "text-slate-500"
          }`
        }
      >
        <Heart className="w-5 h-5" />
        {wishlist.length > 0 && (
          <span className="absolute -top-1 right-2 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
            {wishlist.length}
          </span>
        )}
        <span>Wishlist</span>
      </NavLink>

      <button
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-green-600 transition-colors"
      >
        <ShoppingBag className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute -top-1 right-2 bg-green-600 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        )}
        <span>Cart</span>
      </button>

      <NavLink
        to={isAuthenticated ? "/profile" : "/login"}
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            isActive ? "text-green-600 font-bold" : "text-slate-500"
          }`
        }
      >
        <User className="w-5 h-5" />
        <span>{isAuthenticated ? "Profile" : "Sign In"}</span>
      </NavLink>
    </div>
  );
}
