import React from "react";
import { ShoppingBag, Heart, Search, PackageOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState({
  type = "cart",
  title,
  description,
  actionText = "Start Shopping",
  actionLink = "/products"
}) {
  const getConfig = () => {
    switch (type) {
      case "cart":
        return {
          icon: "🛒",
          defaultTitle: "Your Cart is Empty",
          defaultDesc: "Fresh vegetables, fruits, and juices are waiting for you!"
        };
      case "wishlist":
        return {
          icon: "♡",
          defaultTitle: "Your Wishlist is Empty",
          defaultDesc: "Save products you want to buy later by tapping the heart icon."
        };
      case "search":
        return {
          icon: "🔍",
          defaultTitle: "No products found",
          defaultDesc: "We couldn't find anything matching your search. Try another query or category."
        };
      case "orders":
      default:
        return {
          icon: "📦",
          defaultTitle: "No Orders Yet",
          defaultDesc: "When you place an order, it will appear here for tracking."
        };
    }
  };

  const config = getConfig();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-slate-100 shadow-sm max-w-md mx-auto my-8">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner">
        {config.icon}
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2">
        {title || config.defaultTitle}
      </h3>

      <p className="text-sm text-slate-500 max-w-xs mb-6">
        {description || config.defaultDesc}
      </p>

      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition-colors text-sm"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
