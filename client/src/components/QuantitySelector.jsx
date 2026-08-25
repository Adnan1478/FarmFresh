import React from "react";
import { Minus, Plus, Loader2 } from "lucide-react";

export default function QuantitySelector({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  max = 20,
  isLoading = false,
  size = "md"
}) {
  const isMin = quantity <= min;
  const isMax = quantity >= max;

  const btnPadding = size === "sm" ? "p-1" : "p-1.5";
  const textSize = size === "sm" ? "text-xs px-2 min-w-[24px]" : "text-sm px-3 min-w-[32px]";

  return (
    <div className="inline-flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
      <button
        type="button"
        onClick={onDecrement}
        disabled={isMin || isLoading}
        className={`${btnPadding} text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors`}
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <div className={`${textSize} font-semibold text-slate-800 text-center flex items-center justify-center`}>
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-green-600" /> : quantity}
      </div>

      <button
        type="button"
        onClick={onIncrement}
        disabled={isMax || isLoading}
        className={`${btnPadding} text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors`}
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
