import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Session loading handled cleanly
  }

  if (isAuthenticated) {
    const role = user?.role || "customer";
    if (role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (role === "vendor") {
      return <Navigate to="/vendor/dashboard" replace />;
    }
    if (role === "deliveryboy") {
      return <Navigate to="/delivery/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
