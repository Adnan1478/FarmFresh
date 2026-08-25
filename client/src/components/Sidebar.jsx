import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Store,
  Leaf,
  LogOut,
  User,
  Users,
  MessageSquare,
  Star,
  ChevronLeft,
  ChevronRight,
  Boxes,
  Tag,
  Sprout
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isCollapsed, onToggleCollapse }) {
  const { user, logout } = useAuth();

  return (
    <aside
      className={`bg-slate-900 text-slate-300 h-screen sticky top-0 p-3 sm:p-4 flex flex-col justify-between border-r border-slate-800 transition-all duration-300 ease-in-out shrink-0 select-none overflow-hidden ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Fixed Header: Logo & Collapse Toggle Button */}
      <div className="shrink-0 space-y-4">
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-1`}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
              <Leaf className="w-5 h-5 fill-white" />
            </div>

            {!isCollapsed && (
              <div className="animate-fadeIn">
                <div className="font-black text-white text-base tracking-tight leading-none">
                  Farm<span className="text-green-500">Admin</span>
                </div>
                <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
                  Store Panel
                </div>
              </div>
            )}
          </div>

          {/* Collapse / Expand Toggle Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all ${
              isCollapsed ? "hidden group-hover:block absolute top-4 left-16 z-20 bg-slate-800 shadow-md border border-slate-700" : ""
            }`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Floating Toggle Button for Collapsed View Header */}
        {isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full py-1.5 flex justify-center text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4 text-green-400" />
          </button>
        )}
      </div>

      {/* Middle Scrollable Navigation Menu Container */}
      <nav className="flex-1 overflow-y-auto pr-1 my-4 space-y-1 text-xs font-semibold scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {/* Section 1: Main Dashboard */}
        {!isCollapsed ? (
          <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider py-2">
            Main Dashboard
          </div>
        ) : (
          <div className="my-2 border-t border-slate-800/60" />
        )}

        <NavLink
          to="/admin/dashboard"
          title="Dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isCollapsed ? "justify-center px-0" : ""
            } ${
              isActive
                ? "bg-green-600 text-white font-bold shadow-md"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Dashboard</span>}
        </NavLink>

        {/* Section 2: Products & Catalog */}
        {!isCollapsed ? (
          <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider pt-4 py-2">
            Products & Catalog
          </div>
        ) : (
          <div className="my-2 border-t border-slate-800/60" />
        )}

        <NavLink
          to="/admin/categories"
          title="Categories"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isCollapsed ? "justify-center px-0" : ""
            } ${
              isActive
                ? "bg-green-600 text-white font-bold shadow-md"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <Layers className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Categories</span>}
        </NavLink>

        <NavLink
          to="/admin/products"
          title="Products & Catalog"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isCollapsed ? "justify-center px-0" : ""
            } ${
              isActive
                ? "bg-green-600 text-white font-bold shadow-md"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <ShoppingBag className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Products & Catalog</span>}
        </NavLink>

        <NavLink
          to="/admin/coupons"
          title="Coupons & Flash Sales"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isCollapsed ? "justify-center px-0" : ""
            } ${
              isActive
                ? "bg-green-600 text-white font-bold shadow-md"
                : "text-amber-400 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <Tag className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Coupons & Flash Sales</span>}
        </NavLink>

        {/* Section 3: Inventory & Supply Chain */}
        {!isCollapsed ? (
          <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider pt-4 py-2">
            Inventory & Supply Chain
          </div>
        ) : (
          <div className="my-2 border-t border-slate-800/60" />
        )}

        <NavLink
          to="/admin/inventory"
          title="Inventory & FEFO Batches"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isCollapsed ? "justify-center px-0" : ""
            } ${
              isActive
                ? "bg-green-600 text-white font-bold shadow-md"
                : "text-emerald-400 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <Boxes className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Inventory & Batches</span>}
        </NavLink>

        <NavLink
          to="/admin/vendor-supplies"
          title="Vendor Harvest & Supply"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isCollapsed ? "justify-center px-0" : ""
            } ${
              isActive
                ? "bg-green-600 text-white font-bold shadow-md"
                : "text-emerald-400 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <Sprout className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Vendor Harvest & Supply</span>}
        </NavLink>

        <NavLink
          to="/admin/orders"
          title="Customer Orders"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isCollapsed ? "justify-center px-0" : ""
            } ${
              isActive
                ? "bg-green-600 text-white font-bold shadow-md"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <Package className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Customer Orders</span>}
        </NavLink>

        {/* Section 4: Customer Feedback & Support */}
        {!isCollapsed ? (
          <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider pt-4 py-2">
            Customer Feedback & Support
          </div>
        ) : (
          <div className="my-2 border-t border-slate-800/60" />
        )}

        <NavLink
          to="/admin/reviews"
          title="Product Reviews"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isCollapsed ? "justify-center px-0" : ""
            } ${
              isActive
                ? "bg-green-600 text-white font-bold shadow-md"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <Star className="w-4 h-4 text-amber-400 shrink-0" />
          {!isCollapsed && <span>Product Reviews</span>}
        </NavLink>

        <NavLink
          to="/admin/contacts"
          title="Contact Messages"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isCollapsed ? "justify-center px-0" : ""
            } ${
              isActive
                ? "bg-green-600 text-white font-bold shadow-md"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
          {!isCollapsed && <span>Contact Messages</span>}
        </NavLink>

        {/* Section 5: Account & Access Control */}
        {!isCollapsed ? (
          <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider pt-4 py-2">
            Account & Access Control
          </div>
        ) : (
          <div className="my-2 border-t border-slate-800/60" />
        )}

        <NavLink
          to="/admin/users"
          title="User Management"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isCollapsed ? "justify-center px-0" : ""
            } ${
              isActive
                ? "bg-green-600 text-white font-bold shadow-md"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <Users className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>User Management</span>}
        </NavLink>

        <NavLink
          to="/admin/profile"
          title="Admin Profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isCollapsed ? "justify-center px-0" : ""
            } ${
              isActive
                ? "bg-green-600 text-white font-bold shadow-md"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <User className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Admin Profile</span>}
        </NavLink>

        <div className="pt-2">
          <NavLink
            to="/"
            title="Visit Customer Store"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-emerald-400 hover:bg-emerald-950/50 transition-colors ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
          >
            <Store className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Visit Store</span>}
          </NavLink>
        </div>
      </nav>

      {/* Bottom Fixed Footer: Admin User Badge & Logout */}
      <div className="shrink-0 pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-2">
        {!isCollapsed ? (
          <NavLink
            to="/admin/profile"
            className="block px-3 py-2 bg-slate-800/60 hover:bg-slate-800 rounded-xl space-y-0.5 transition-colors"
          >
            <div className="font-bold text-slate-200 truncate">{user?.name || "Admin Session"}</div>
            <div className="text-[10px] text-slate-400 truncate">{user?.email || "admin@farmfresh.com"}</div>
          </NavLink>
        ) : (
          <NavLink
            to="/admin/profile"
            title={user?.name || "Admin Profile"}
            className="w-10 h-10 mx-auto rounded-xl bg-slate-800 text-slate-200 font-bold flex items-center justify-center text-xs"
          >
            {user?.name?.[0]?.toUpperCase() || "A"}
          </NavLink>
        )}

        <button
          onClick={logout}
          title="Log Out"
          className={`w-full flex items-center gap-2 py-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 font-bold rounded-xl transition-colors text-xs ${
            isCollapsed ? "justify-center px-0" : "px-3"
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
