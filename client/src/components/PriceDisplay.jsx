import React from "react";

export default function PriceDisplay({ price, discountPrice, unit, className = "" }) {
  const currentPrice = discountPrice || price;
  const hasDiscount = discountPrice && discountPrice < price;
  const discountPercentage = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  return (
    <div className={`flex items-baseline gap-2 flex-wrap ${className}`}>
      <span className="text-lg font-bold text-slate-900">
        ₹{currentPrice}
        {unit && <span className="text-xs font-normal text-slate-500"> / {unit}</span>}
      </span>

      {hasDiscount && (
        <>
          <span className="text-xs text-slate-400 line-through">₹{price}</span>
          <span className="bg-amber-100 text-amber-800 text-[11px] font-semibold px-1.5 py-0.5 rounded">
            -{discountPercentage}%
          </span>
        </>
      )}
    </div>
  );
}
