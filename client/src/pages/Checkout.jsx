import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, ShieldCheck, CreditCard, Smartphone, Banknote, Truck, Loader2, ArrowLeft, MapPin, Sparkles, Save, Info, Zap } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { updateProfileApi } from "../api/authApi";
import { createRazorpayOrderApi, verifyRazorpayPaymentApi } from "../api/paymentApi";

export default function Checkout() {
  const { cart, cartSubtotal, deliveryFee, cartTotal, placeOrder, showToast } = useShop();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(2); // 1: Cart, 2: Address, 3: Payment
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAddressToProfile, setIsSavingAddressToProfile] = useState(false);
  const [saveToProfile, setSaveToProfile] = useState(true);

  // Address State (Auto-populated from User's Saved MongoDB Address or initialized for new users)
  const [address, setAddress] = useState({
    fullName: user?.address?.fullName || user?.name || "",
    phone: user?.address?.phone || user?.phone || "",
    addressLine: user?.address?.addressLine || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.pincode || "",
    landmark: user?.address?.landmark || ""
  });

  useEffect(() => {
    if (user) {
      setAddress({
        fullName: user.address?.fullName || user.name || "",
        phone: user.address?.phone || user.phone || "",
        addressLine: user.address?.addressLine || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        pincode: user.address?.pincode || "",
        landmark: user.address?.landmark || ""
      });
    }
  }, [user]);

  // Load Razorpay Checkout Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Delivery slot
  const [deliverySlot, setDeliverySlot] = useState("express");

  // Payment Method State: "COD" or "Razorpay"
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");

  if (cart.length === 0) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Your cart is empty</h2>
        <p className="text-sm text-slate-500">Please add items to your cart before proceeding to checkout.</p>
        <Link to="/products" className="inline-block bg-green-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
          Browse Vegetables & Fruits
        </Link>
      </div>
    );
  }

  // Handle Proceed from Step 2 to Step 3 with automatic address save to profile for new users
  const handleProceedToPayment = async () => {
    if (!address.fullName || !address.phone || !address.addressLine || !address.city || !address.pincode) {
      showToast("Please fill in all required shipping address fields", "error");
      return;
    }

    // Save to user profile in MongoDB if checked or if user has no saved address yet
    if (saveToProfile || !user?.address?.addressLine) {
      setIsSavingAddressToProfile(true);
      try {
        const res = await updateProfileApi({ address });
        if (res.data?.success && res.data?.user) {
          setUser(res.data.user);
          showToast("✓ Address saved to your profile database for future orders!", "success");
        }
      } catch (err) {
        // Continue checkout even if profile save fails
      } finally {
        setIsSavingAddressToProfile(false);
      }
    }

    setCurrentStep(3);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!address.fullName || !address.phone || !address.addressLine || !address.city || !address.pincode) {
      showToast("Please fill in all required shipping address fields", "error");
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. If Payment Method is COD
      if (paymentMethod === "COD") {
        const order = await placeOrder({
          shippingAddress: address,
          paymentMethod: "COD"
        });
        showToast("✓ Order Confirmed successfully!", "success");
        navigate(`/order-success/${order._id}`);
        return;
      }

      // 2. If Payment Method is Razorpay Online Payment
      const razorpayOrderRes = await createRazorpayOrderApi(cartTotal);
      if (!razorpayOrderRes.data?.success || !razorpayOrderRes.data?.data) {
        throw new Error(razorpayOrderRes.data?.message || "Failed to initialize Razorpay payment");
      }

      const rzpData = razorpayOrderRes.data.data;

      const options = {
        key: rzpData.key,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "FarmFresh Organic Groceries",
        description: "Fresh Vegetables & Fruits Order",
        image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=100&q=80",
        order_id: rzpData.id,
        handler: async function (response) {
          try {
            const verifyRes = await verifyRazorpayPaymentApi({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              const order = await placeOrder({
                shippingAddress: address,
                paymentMethod: "Card",
                paymentStatus: "Paid",
              });
              showToast("✓ Razorpay Payment Verified & Order Placed!", "success");
              navigate(`/order-success/${order._id}`);
            }
          } catch (err) {
            showToast("Payment verification failed. Please contact support.", "error");
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: address.fullName,
          email: user?.email || "",
          contact: address.phone,
        },
        theme: {
          color: "#16a34a", // FarmFresh Green
        },
        modal: {
          ondismiss: function () {
            showToast("Payment popup closed.", "info");
            setIsSubmitting(false);
          },
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        showToast("Razorpay SDK failed to load. Please check internet connection.", "error");
        setIsSubmitting(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to place order. Try again.", "error");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto text-xs">
      {/* Back button */}
      <Link to="/cart" className="inline-flex items-center gap-1 font-bold text-slate-600 hover:text-green-600 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Cart</span>
      </Link>

      {/* Stepped Progress Indicator */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-xs">
        {/* Desktop Stepped Indicator */}
        <div className="hidden sm:flex items-center justify-between relative max-w-2xl mx-auto font-bold">
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">✓</div>
            <span>Cart</span>
          </div>

          <div className={`h-1 flex-1 mx-4 rounded ${currentStep >= 2 ? "bg-emerald-500" : "bg-slate-200"}`} />

          <div className={`flex items-center gap-2 ${currentStep >= 2 ? "text-emerald-600" : "text-slate-400"}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>
              {currentStep > 2 ? "✓" : "2"}
            </div>
            <span>Shipping Address</span>
          </div>

          <div className={`h-1 flex-1 mx-4 rounded ${currentStep >= 3 ? "bg-emerald-500" : "bg-slate-200"}`} />

          <div className={`flex items-center gap-2 ${currentStep >= 3 ? "text-emerald-600" : "text-slate-400"}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>
              3
            </div>
            <span>Payment & Confirmation</span>
          </div>
        </div>

        {/* Mobile Stepped Progress */}
        <div className="sm:hidden text-center space-y-1">
          <div className="font-bold text-slate-400 uppercase tracking-wider">
            Step {currentStep} of 3
          </div>
          <div className="text-sm font-black text-slate-800">
            {currentStep === 2 ? "Shipping Address" : "Payment & Order Summary"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Main Checkout Form Step 2 & 3 */}
        <div className="md:col-span-2 space-y-6">
          {/* Step 2: Shipping Address */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span>1. Delivery Shipping Address</span>
                </h2>

                {user?.address?.addressLine ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Auto-filled from Profile Database
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Info className="w-3 h-3" /> New Customer Address
                  </span>
                )}
              </div>

              {!user?.address?.addressLine && (
                <div className="bg-blue-50 border border-blue-100 text-blue-800 p-3 rounded-xl flex items-center gap-2 font-medium">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Welcome! Enter your delivery address below. It will be saved automatically to your profile for future orders.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full recipient name"
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Address Line (Street, Flat, House No.) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 402, Green Meadows, MG Road"
                    value={address.addressLine}
                    onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 400001"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. Near HDFC Bank / Park"
                    value={address.landmark}
                    onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Save to Profile Checkbox for New & Existing Users */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={saveToProfile}
                    onChange={(e) => setSaveToProfile(e.target.checked)}
                    className="w-4 h-4 accent-green-600 rounded cursor-pointer"
                  />
                  <span>Save this delivery address to my account profile for future fast checkouts</span>
                </label>
              </div>

              {/* Delivery Speed Selector */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <label className="block font-bold text-slate-700 uppercase">Select Delivery Slot:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliverySlot("express")}
                    className={`p-3 rounded-xl border text-left font-semibold flex items-center gap-2 ${
                      deliverySlot === "express" ? "border-green-600 bg-green-50/50 text-green-800" : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <Truck className="w-4 h-4 text-green-600" />
                    <div>
                      <div>⚡ Express (2 Hours)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Today by 7:00 PM</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliverySlot("standard")}
                    className={`p-3 rounded-xl border text-left font-semibold flex items-center gap-2 ${
                      deliverySlot === "standard" ? "border-green-600 bg-green-50/50 text-green-800" : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <Truck className="w-4 h-4 text-slate-400" />
                    <div>
                      <div>Standard Delivery</div>
                      <div className="text-[10px] text-slate-400 font-normal">Tomorrow Morning</div>
                    </div>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={isSavingAddressToProfile}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-md text-xs transition-colors flex items-center justify-center gap-2"
              >
                {isSavingAddressToProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Address to Database...</span>
                  </>
                ) : (
                  <span>Proceed to Payment →</span>
                )}
              </button>
            </div>
          )}

          {/* Step 3: Payment Selection */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                2. Select Payment Method
              </h2>

              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === "Razorpay" ? "border-green-600 bg-green-50/50" : "border-slate-200"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="Razorpay"
                    checked={paymentMethod === "Razorpay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-green-600"
                  />
                  <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shrink-0">
                    <Zap className="w-4 h-4 fill-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <span>Razorpay Online Payment</span>
                      <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded-full">Recommended</span>
                    </div>
                    <div className="text-slate-400">Cards (Visa/Mastercard), UPI (GPay/PhonePe), NetBanking & Wallets</div>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === "COD" ? "border-green-600 bg-green-50/50" : "border-slate-200"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-green-600"
                  />
                  <Banknote className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">Cash on Delivery (COD)</div>
                    <div className="text-slate-400">Pay cash or UPI at your doorstep upon delivery</div>
                  </div>
                </label>
              </div>

              {/* Delivery Address Summary Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>Shipping Address Preview:</span>
                  <button onClick={() => setCurrentStep(2)} className="text-green-600 hover:underline text-[11px]">Edit</button>
                </div>
                <div className="text-slate-700 font-semibold">{address.fullName} ({address.phone})</div>
                <div className="text-slate-500">{address.addressLine}, {address.city}, {address.state} - {address.pincode}</div>
              </div>

              {/* Idempotency Protected Place Order Button */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs"
                >
                  ← Edit Address
                </button>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all active:scale-98"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <span>
                      {paymentMethod === "Razorpay" ? `Pay with Razorpay (₹${cartTotal})` : `Place Order (₹${cartTotal})`}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
            Order Items ({cart.length})
          </h3>

          <div className="space-y-3 max-h-56 overflow-y-auto divide-y divide-slate-50 divide-solid">
            {cart.map((item) => (
              <div key={item.product._id} className="pt-2 flex justify-between items-center">
                <div className="truncate pr-2">
                  <div className="font-semibold text-slate-800 truncate">{item.product.name}</div>
                  <div className="text-slate-400">{item.quantity} x ₹{item.price}</div>
                </div>
                <div className="font-bold text-slate-900 shrink-0">₹{item.price * item.quantity}</div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">₹{cartSubtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="font-semibold text-slate-800">{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Amount</span>
              <span className="text-green-700 text-base">₹{cartTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
