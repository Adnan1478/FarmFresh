import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { message, type } = toast;

  const getStyle = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-emerald-600",
          icon: <CheckCircle2 className="w-5 h-5 text-white" />
        };
      case "error":
        return {
          bg: "bg-red-600",
          icon: <AlertCircle className="w-5 h-5 text-white" />
        };
      case "info":
      default:
        return {
          bg: "bg-slate-800",
          icon: <Info className="w-5 h-5 text-white" />
        };
    }
  };

  const style = getStyle();

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 animate-slideUp">
      <div
        className={`${style.bg} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[280px] max-w-md border border-white/10`}
      >
        {style.icon}
        <span className="text-sm font-medium flex-1">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
