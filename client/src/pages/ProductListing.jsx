import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, ArrowUpDown, X, Check, Filter } from "lucide-react";
import { useShop } from "../context/ShopContext";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";

export default function ProductListing() {
  const { products, categories } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get("category") || "all";
  const searchParam = searchParams.get("search") || "";
  const filterParam = searchParams.get("filter") || "";

  // Local Filter States
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [priceMax, setPriceMax] = useState(600);
  const [onlyOrganic, setOnlyOrganic] = useState(filterParam === "organic");
  const [sortBy, setSortBy] = useState("popular");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state if URL param changes
  React.useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (filterParam === "organic") setOnlyOrganic(true);
  }, [categoryParam, filterParam]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        // Category filter
        if (selectedCategory !== "all") {
          const catMatch =
            prod.category?.slug === selectedCategory ||
            prod.category?._id === selectedCategory ||
            prod.category?.name?.toLowerCase() === selectedCategory.toLowerCase();
          if (!catMatch) return false;
        }

        // Search Query filter
        if (searchParam) {
          const matchName = prod.name.toLowerCase().includes(searchParam.toLowerCase());
          const matchCat = prod.category.name.toLowerCase().includes(searchParam.toLowerCase());
          if (!matchName && !matchCat) return false;
        }

        // Price filter
        const price = prod.discountPrice || prod.price;
        if (price > priceMax) return false;

        // Organic filter
        if (onlyOrganic && !prod.isOrganic) return false;

        return true;
      })
      .sort((a, b) => {
        const priceA = a.discountPrice || a.price;
        const priceB = b.discountPrice || b.price;

        if (sortBy === "price-low") return priceA - priceB;
        if (sortBy === "price-high") return priceB - priceA;
        if (sortBy === "rating") return (b.averageRating || 0) - (a.averageRating || 0);
        // Default popular
        return b.isFeatured ? 1 : -1;
      });
  }, [products, selectedCategory, searchParam, priceMax, onlyOrganic, sortBy]);

  const clearFilters = () => {
    setSelectedCategory("all");
    setPriceMax(600);
    setOnlyOrganic(false);
    setSortBy("popular");
    setSearchParams({});
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Active Search header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {searchParam
              ? `Search Results for "${searchParam}"`
              : selectedCategory !== "all"
              ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Produce`
              : "All Fresh Produce"}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Showing <strong className="text-slate-800">{filteredProducts.length}</strong> products
          </p>
        </div>

        {/* Desktop & Mobile Sort Control */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-green-600" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs shadow-xs flex-1 sm:flex-none">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-xs"
            >
              <option value="popular">Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Pill Badges */}
      {(selectedCategory !== "all" || priceMax < 600 || onlyOrganic || searchParam) && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium">Active Filters:</span>

          {selectedCategory !== "all" && (
            <span className="bg-green-100 text-green-800 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory("all")}><X className="w-3 h-3" /></button>
            </span>
          )}

          {onlyOrganic && (
            <span className="bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              🌱 Organic Only
              <button onClick={() => setOnlyOrganic(false)}><X className="w-3 h-3" /></button>
            </span>
          )}

          {priceMax < 600 && (
            <span className="bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              Max ₹{priceMax}
              <button onClick={() => setPriceMax(600)}><X className="w-3 h-3" /></button>
            </span>
          )}

          <button
            onClick={clearFilters}
            className="text-xs text-red-600 font-bold hover:underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filter Panel */}
        <aside className="hidden md:block bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-6 sticky top-28">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-green-600" />
              Filter Products
            </h3>
            <button
              onClick={clearFilters}
              className="text-xs text-slate-400 hover:text-red-500 font-semibold"
            >
              Reset
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Category
            </label>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-green-50 text-green-700 font-bold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === cat.slug
                      ? "bg-green-50 text-green-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{cat.name}</span>
                  {selectedCategory === cat.slug && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Organic Toggle */}
          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyOrganic}
                onChange={(e) => setOnlyOrganic(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded border-slate-300 focus:ring-green-500"
              />
              <span className="text-xs font-semibold text-slate-800">
                🌱 Only 100% Organic
              </span>
            </label>
          </div>

          {/* Price Range Slider */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-700 uppercase tracking-wider">Max Price</span>
              <span className="text-green-700 font-bold">₹{priceMax}</span>
            </div>
            <input
              type="range"
              min="30"
              max="600"
              step="10"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-green-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹30</span>
              <span>₹600</span>
            </div>
          </div>
        </aside>

        {/* Product Grid Content */}
        <div className="md:col-span-3">
          {filteredProducts.length === 0 ? (
            <EmptyState
              type="search"
              title="No matching produce found"
              description="Try resetting your active filters or search term to see more items."
              actionText="Reset Filters"
              actionLink="/products"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white shadow-2xl p-6 space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Filter className="w-4 h-4 text-green-600" />
                  Filter Options
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Filter Options */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Category</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                        selectedCategory === "all" ? "bg-green-50 text-green-700" : "text-slate-600"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c._id}
                        onClick={() => setSelectedCategory(c.slug)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                          selectedCategory === c.slug ? "bg-green-50 text-green-700" : "text-slate-600"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyOrganic}
                      onChange={(e) => setOnlyOrganic(e.target.checked)}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-xs font-semibold text-slate-800">🌱 Organic Produce Only</span>
                  </label>
                </div>
              </div>

              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-md text-xs"
              >
                Apply Filters ({filteredProducts.length} items)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
