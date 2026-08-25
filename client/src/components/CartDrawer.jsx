import React from "react";
import { X, Trash2, ArrowRight, ShoppingBag, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import QuantitySelector from "./QuantitySelector";
import EmptyState from "./EmptyState";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    selectedItemIds,
    selectedCart,
    selectedCartSubtotal,
    selectedDeliveryFee,
    selectedCartTotal,
    toggleSelectItem
  } = useShop();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-xs">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-slideLeft">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-bold text-slate-800">Your Cart</h2>
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {selectedCart.length} of {cart.length} selected
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery progress callout */}
          {selectedCartSubtotal > 0 && selectedCartSubtotal < 500 && (
            <div className="bg-amber-50 px-4 py-2 text-xs text-amber-800 border-b border-amber-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Add <strong>₹{500 - selectedCartSubtotal}</strong> more for <strong>FREE Delivery</strong>!
              </span>
            </div>
          )}

          {/* Cart Items List with Checkboxes */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <EmptyState
                type="cart"
                actionText="Start Shopping"
                actionLink="/products"
              />
            ) : (
              cart.map((item) => {
                const isSelected = selectedItemIds.includes(item.product._id);
                return (
                  <div
                    key={item.product._id}
                    className={`py-4 flex gap-3 items-center transition-all ${
                      isSelected ? "opacity-100" : "opacity-50 bg-slate-50/50 p-2 rounded-xl"
                    }`}
                  >
                    {/* Item Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectItem(item.product._id)}
                      className="w-4 h-4 accent-green-600 rounded cursor-pointer shrink-0"
                    />

                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover rounded-xl bg-slate-50 border border-slate-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-800 truncate mb-0.5">
                        {item.product.name}
                      </h4>
                      <div className="text-xs text-slate-500 mb-1.5">
                        ₹{item.price} / {item.product.unit}
                      </div>
                      <QuantitySelector
                        quantity={item.quantity}
                        onIncrement={() => updateCartQuantity(item.product._id, 1)}
                        onDecrement={() => updateCartQuantity(item.product._id, -1)}
                        max={item.product.maxOrderQuantity || 20}
                        size="sm"
                      />
                    </div>

                    <div className="flex flex-col items-end justify-between self-stretch">
                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-xs font-bold text-slate-900">
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Selected Subtotal ({selectedCart.length} items)</span>
                  <span className="font-semibold text-slate-800">₹{selectedCartSubtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-slate-800">
                    {selectedDeliveryFee === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${selectedDeliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Payable</span>
                  <span className="text-green-700 text-base">₹{selectedCartTotal}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={selectedCart.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all text-xs active:scale-98"
              >
                <span>
                  {selectedCart.length === 0 ? "Select Items to Checkout" : `Proceed to Checkout (₹${selectedCartTotal})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
