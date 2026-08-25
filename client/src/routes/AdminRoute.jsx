import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { ShieldAlert, Loader2, Leaf, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-3 bg-slate-50">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounceCustom shadow-sm">
          <Leaf className="w-6 h-6 fill-emerald-600 text-emerald-600" />
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Verifying Admin Credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 text-center gap-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-md">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900">403 - Access Forbidden</h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You do not have administrative permissions to view the Store Control Panel.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Store Front</span>
        </Link>
      </div>
    );
  }

  return children;
}
