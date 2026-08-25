import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag, Undo2, CheckSquare, Square } from "lucide-react";
import { useShop } from "../context/ShopContext";
import QuantitySelector from "../components/QuantitySelector";
import EmptyState from "../components/EmptyState";

import { validateCouponApi } from "../api/couponApi";

export default function CartPage() {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    selectedItemIds,
    selectedCart,
    selectedCartSubtotal,
    selectedDeliveryFee,
    selectedCartTotal,
    toggleSelectItem,
    selectAllItems,
    deselectAllItems,
    showToast
  } = useShop();

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [lastRemovedItem, setLastRemovedItem] = useState(null);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const res = await validateCouponApi(couponCode, selectedCartSubtotal);
      if (res.data?.success && res.data?.data) {
        setDiscount(res.data.data.discountAmount);
        setCouponApplied(true);
        showToast(res.data.message || `✓ Coupon ${couponCode.toUpperCase()} applied!`, "success");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Invalid coupon code", "error");
    }
  };

  const handleRemove = (item) => {
    setLastRemovedItem(item);
    removeFromCart(item.product._id);
  };

  const handleUndo = () => {
    if (lastRemovedItem) {
      updateCartQuantity(lastRemovedItem.product._id, lastRemovedItem.quantity);
      setLastRemovedItem(null);
      showToast("✓ Item restored to cart", "success");
    }
  };

  const isAllSelected = cart.length > 0 && selectedItemIds.length === cart.length;

  const handleToggleMasterSelect = () => {
    if (isAllSelected) {
      deselectAllItems();
    } else {
      selectAllItems();
    }
  };

  if (cart.length === 0) {
    return (
      <div className="py-8">
        <EmptyState
          type="cart"
          title="Your Cart is Empty"
          description="Fresh vegetables and fruits are waiting for you!"
          actionText="Start Shopping"
          actionLink="/products"
        />
      </div>
    );
  }

  const finalTotal = Math.max(0, selectedCartTotal - discount);

  return (
    <div className="space-y-8 pb-16 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-green-600" />
            <span>Shopping Cart</span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Select the specific items you want to buy for this order.
          </p>
        </div>

        <Link to="/products" className="text-xs font-bold text-green-600 hover:underline">
          + Add More Items
        </Link>
      </div>

      {/* Undo Notification Banner */}
      {lastRemovedItem && (
        <div className="bg-slate-800 text-white px-4 py-3 rounded-2xl flex items-center justify-between text-xs animate-slideDown shadow-md">
          <span>✓ {lastRemovedItem.product.name} removed from cart</span>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 font-bold text-green-400 hover:underline"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Cart Items List with Selection Checkboxes */}
        <div className="lg:col-span-2 space-y-4">
          {/* Master Select All Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between font-bold text-slate-800">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleToggleMasterSelect}
                className="w-4 h-4 accent-green-600 rounded cursor-pointer"
              />
              <span>Select All Items ({selectedItemIds.length} of {cart.length} selected)</span>
            </label>

            {selectedItemIds.length > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                {selectedItemIds.length} ready to checkout
              </span>
            )}
          </div>

          {/* Item Cards with Checkboxes */}
          {cart.map((item) => {
            const isSelected = selectedItemIds.includes(item.product._id);

            return (
              <div
                key={item.product._id}
                className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row items-center gap-4 justify-between ${
                  isSelected
                    ? "bg-white border-slate-200 shadow-xs"
                    : "bg-slate-50/60 border-slate-200/60 opacity-60"
                }`}
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {/* Item Select Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectItem(item.product._id)}
                    className="w-5 h-5 accent-green-600 rounded cursor-pointer shrink-0"
                    title={isSelected ? "Uncheck to exclude from checkout" : "Check to include in checkout"}
                  />

                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-xl bg-slate-50 border border-slate-100 shrink-0"
                  />

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 mb-0.5">
                      {item.product.name}
                    </h3>
                    <div className="text-xs text-slate-400 mb-2">
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
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-base font-black text-slate-900">
                    ₹{item.price * item.quantity}
                  </div>
                  <button
                    onClick={() => handleRemove(item)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Checkout Card (Reflects ONLY Selected Items) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-6 sticky top-28">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Order Summary</span>
            <span className="text-xs font-semibold text-slate-500">
              ({selectedCart.length} selected)
            </span>
          </h2>

          {/* Promo Coupon Form */}
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Coupon code (FRESH20)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={couponApplied}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-green-600 uppercase font-semibold"
              />
              <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
            </div>
            <button
              type="submit"
              disabled={couponApplied || !couponCode.trim() || selectedCart.length === 0}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shrink-0"
            >
              {couponApplied ? "Applied" : "Apply"}
            </button>
          </form>

          {/* Breakdown for Selected Items Only */}
          <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
            <div className="flex justify-between">
              <span>Selected Items Subtotal</span>
              <span className="font-semibold text-slate-800">₹{selectedCartSubtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span className="font-semibold text-slate-800">
                {selectedDeliveryFee === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${selectedDeliveryFee}`}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-700 font-bold">
                <span>Coupon Discount (20%)</span>
                <span>-₹{discount}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-black text-slate-900 pt-3 border-t border-slate-200">
              <span>Total Payable</span>
              <span className="text-green-700 text-lg">₹{finalTotal}</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            disabled={selectedCart.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all text-sm active:scale-98"
          >
            <span>
              {selectedCart.length === 0
                ? "Select Items to Checkout"
                : `Proceed to Checkout (${selectedCart.length} items • ₹${finalTotal})`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
