import React from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Clock, MapPin, PackageCheck, ShoppingBag, ArrowRight } from "lucide-react";
import { useShop } from "../context/ShopContext";

export default function OrderSuccess() {
  const { id } = useParams();
  const { orders } = useShop();

  const order = orders.find((o) => o._id === id || o.orderNumber === id) || orders[0];

  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6">
      {/* Big Animated Confirmation Checkmark */}
      <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounceCustom">
        <CheckCircle2 className="w-14 h-14" />
      </div>

      <div>
        <h1 className="text-3xl font-black text-slate-900">Order Confirmed!</h1>
        <p className="text-sm text-slate-500 mt-1">
          Thank you for shopping with FarmFresh. We're preparing your organic produce now.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-left space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Order Number:</span>{" "}
            <strong className="text-slate-900 font-bold">#{order?.orderNumber || "ORD-10245"}</strong>
          </div>
          <span className="bg-green-100 text-green-800 font-bold px-2.5 py-0.5 rounded-full">
            ● {order?.orderStatus || "Confirmed"}
          </span>
        </div>

        {/* Delivery Slot info */}
        <div className="bg-emerald-50 p-4 rounded-2xl flex items-center gap-3">
          <Clock className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <div className="text-emerald-900 font-bold">Estimated Delivery</div>
            <div className="text-emerald-700 font-medium">Today, 5:00 PM – 7:00 PM (Within 2 Hours)</div>
          </div>
        </div>

        {/* Items summary */}
        <div className="space-y-2 text-xs divide-y divide-slate-50">
          <div className="font-bold text-slate-700 pb-1">Items Ordered:</div>
          {order?.items?.map((item, idx) => (
            <div key={idx} className="pt-2 flex justify-between items-center">
              <span className="text-slate-800 font-medium">
                {item.name} ({item.quantity}x)
              </span>
              <span className="font-bold text-slate-900">₹{item.subtotal || item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-between text-sm font-black text-slate-900">
          <span>Total Paid ({order?.paymentMethod}):</span>
          <span className="text-green-700">₹{order?.totalAmount}</span>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          to={`/orders`}
          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <PackageCheck className="w-4 h-4" />
          <span>Track Order Status</span>
        </Link>

        <Link
          to="/products"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
}
