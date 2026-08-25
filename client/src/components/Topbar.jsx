import React from "react";
import { ShieldCheck, Store, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Topbar({ isCollapsed, onToggleCollapse }) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Sidebar Collapse Toggle Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 font-bold text-xs"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-green-600" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-slate-600" />
          )}
        </button>

        <span className="text-xs font-bold bg-green-100 text-green-800 px-2.5 py-1 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Admin Mode
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Admin Real-Time Notification Bell */}
        <NotificationBell />

        <Link
          to="/"
          className="text-xs font-bold text-slate-700 hover:text-green-600 bg-slate-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
        >
          <Store className="w-4 h-4 text-green-600" />
          <span>View Customer Store</span>
        </Link>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
            {user?.name?.[0] || "A"}
          </div>
          <div className="text-xs hidden sm:block">
            <div className="font-bold text-slate-800">{user?.name || "Store Manager"}</div>
            <div className="text-[10px] text-slate-400">{user?.email || "admin@farmfresh.com"}</div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            title="Log Out of Admin Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
