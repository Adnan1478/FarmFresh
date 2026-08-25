import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, Check, Loader2, ShoppingBag } from "lucide-react";
import PriceDisplay from "./PriceDisplay";
import { useShop } from "../context/ShopContext";

export default function ProductCard({ product }) {
  const { addToCart, wishlist, toggleWishlist } = useShop();
  const [btnState, setBtnState] = useState("IDLE");

  const isWishlisted = wishlist.includes(product._id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (btnState === "ADDING") return;

    setBtnState("ADDING");
    try {
      await addToCart(product, 1);
      setBtnState("SUCCESS");
      setTimeout(() => {
        setBtnState("IDLE");
      }, 1500);
    } catch (err) {
      setBtnState("ERROR");
      setTimeout(() => {
        setBtnState("IDLE");
      }, 2000);
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  const hasReviews = product.totalReviews > 0;
  const ratingDisplay = hasReviews ? Number(product.averageRating).toFixed(1) : "0.0";
  const reviewCountDisplay = product.totalReviews || 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden h-full">
      {/* Top Section: Badges & Wishlist */}
      <div>
        <div className="flex items-center justify-between min-h-[28px] mb-2 z-10 relative">
          <div className="flex flex-wrap items-center gap-1.5">
            {product.discountPrice && product.discountPrice < product.price && (
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2 py-0.5 rounded-md">
                -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
              </span>
            )}
            {product.isOrganic && (
              <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                🌱 Organic
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleWishlistClick}
            className={`p-1.5 rounded-full transition-all ${
              isWishlisted
                ? "bg-red-50 text-red-500 hover:bg-red-100"
                : "bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50"
            }`}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
          </button>
        </div>

        {/* Product Image Link */}
        <Link to={`/product/${product._id}`} className="block mb-3 overflow-hidden rounded-xl relative group-hover:opacity-95 transition-opacity">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-44 object-cover object-center group-hover:scale-105 transition-transform duration-300 rounded-xl bg-slate-50"
            loading="lazy"
          />
        </Link>

        {/* Rating and Title */}
        <div className="flex flex-col gap-1 mb-2">
          <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
            <Star className={`w-3.5 h-3.5 ${hasReviews ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
            <span>{ratingDisplay}</span>
            <span className="text-slate-400 font-normal text-[11px]">({reviewCountDisplay})</span>
          </div>

          <Link to={`/product/${product._id}`}>
            <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-green-600 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>
      </div>

      {/* Bottom Section: Price & Action Button */}
      <div className="pt-2 border-t border-slate-50 flex flex-col gap-2.5 mt-2">
        <PriceDisplay
          price={product.price}
          discountPrice={product.discountPrice}
          unit={product.unit}
        />

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={btnState === "ADDING" || product.stockQuantity === 0}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-180 shadow-xs ${
            product.stockQuantity === 0
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : btnState === "SUCCESS"
              ? "bg-emerald-600 text-white"
              : btnState === "ERROR"
              ? "bg-red-600 text-white"
              : "bg-green-600 hover:bg-green-700 text-white active:scale-98"
          }`}
        >
          {btnState === "ADDING" && (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Adding...</span>
            </>
          )}

          {btnState === "SUCCESS" && (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>✓ Added</span>
            </>
          )}

          {btnState === "ERROR" && <span>Unable to add - Try Again</span>}

          {btnState === "IDLE" && (product.stockQuantity > 0 || product.stockQuantity === undefined) && (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </>
          )}

          {product.stockQuantity === 0 && <span>Out of Stock</span>}
        </button>
      </div>
    </div>
  );
}
