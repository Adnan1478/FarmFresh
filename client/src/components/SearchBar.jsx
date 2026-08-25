import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";

export default function SearchBar({ placeholder = "Search vegetables, fruits, juices..." }) {
  const { products, searchQuery, setSearchQuery } = useShop();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 0) {
      setIsOpen(true);
      setIsSearching(true);
      setTimeout(() => setIsSearching(false), 200);
    } else {
      setIsOpen(false);
    }
  };

  const filteredProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectProduct = (id) => {
    setIsOpen(false);
    navigate(`/product/${id}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          onFocus={() => searchQuery.trim() && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-slate-100/80 border border-slate-200 focus:border-green-600 focus:bg-white text-slate-800 text-sm rounded-xl pl-10 pr-10 py-2.5 transition-all outline-none"
        />

        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />

        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Autocomplete Predictive Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-slideDown">
          {isSearching ? (
            <div className="p-4 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-green-600" />
              <span>Searching fresh produce...</span>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div>
              <div className="p-2 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Matching Products ({filteredProducts.length})
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                {filteredProducts.slice(0, 5).map((prod) => (
                  <button
                    key={prod._id}
                    onClick={() => handleSelectProduct(prod._id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-green-50/50 transition-colors text-left"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-10 h-10 object-cover rounded-lg bg-slate-50"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">
                        {prod.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {prod.category.name}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-green-600">
                      ₹{prod.discountPrice || prod.price}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleSearchSubmit}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs text-center flex items-center justify-center gap-1 transition-colors border-t border-slate-100"
              >
                <span>View all results ({filteredProducts.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="text-3xl mb-2">🥦</div>
              <div className="text-sm font-bold text-slate-800 mb-1">
                No products found
              </div>
              <div className="text-xs text-slate-500 mb-3">
                We couldn't find anything matching "{searchQuery}"
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setIsOpen(false);
                  navigate("/products");
                }}
                className="text-xs text-green-600 font-semibold hover:underline"
              >
                Browse All Vegetables & Fruits →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
