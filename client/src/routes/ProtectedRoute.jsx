import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2, Leaf } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center gap-3">
        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounceCustom shadow-sm">
          <Leaf className="w-6 h-6 fill-green-600 text-green-600" />
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <Loader2 className="w-4 h-4 animate-spin text-green-600" />
          <span>Verifying authentication session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
