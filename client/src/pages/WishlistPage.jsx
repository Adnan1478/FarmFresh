import React from "react";
import { Heart } from "lucide-react";
import { useShop } from "../context/ShopContext";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";

export default function WishlistPage() {
  const { products, wishlist } = useShop();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p._id));

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            My Wishlist
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {wishlistedProducts.length} saved products to buy later
          </p>
        </div>
      </div>

      {wishlistedProducts.length === 0 ? (
        <EmptyState
          type="wishlist"
          title="Your Wishlist is Empty"
          description="Save products you want to buy later by clicking the heart icon on any card."
          actionText="Explore Fresh Products"
          actionLink="/products"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
