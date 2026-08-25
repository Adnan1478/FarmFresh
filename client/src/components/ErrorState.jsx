import React from "react";
import { AlertTriangle, RefreshCw, WifiOff, Lock } from "lucide-react";

export default function ErrorState({
  type = "general",
  title,
  message,
  onRetry
}) {
  const getDetails = () => {
    switch (type) {
      case "network":
        return {
          icon: <WifiOff className="w-8 h-8 text-amber-600" />,
          defaultTitle: "Connection Problem",
          defaultMsg: "We couldn't reach the server. Please check your internet connection and try again."
        };
      case "auth":
        return {
          icon: <Lock className="w-8 h-8 text-amber-600" />,
          defaultTitle: "Sign-in Required",
          defaultMsg: "Please sign in to your account before proceeding with your order."
        };
      case "general":
      default:
        return {
          icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
          defaultTitle: "Something went wrong",
          defaultMsg: "We couldn't process your request right now. Please try again."
        };
    }
  };

  const details = getDetails();

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50/50 border border-red-100 rounded-2xl text-center max-w-md mx-auto my-6">
      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
        {details.icon}
      </div>

      <h4 className="text-lg font-bold text-slate-800 mb-1">
        {title || details.defaultTitle}
      </h4>

      <p className="text-sm text-slate-600 mb-6">
        {message || details.defaultMsg}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2 rounded-xl text-sm transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
