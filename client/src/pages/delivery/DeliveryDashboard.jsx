import React, { useState, useEffect } from "react";
import {
  Truck,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  DollarSign,
  Loader2,
  LogOut,
  ShieldCheck
} from "lucide-react";
import { getAssignedDeliveryOrdersApi, updateDeliveryStatusApi } from "../../api/deliveryApi";
import { useAuth } from "../../context/AuthContext";
import { useShop } from "../../context/ShopContext";

export default function DeliveryDashboard() {
  const { user, logout } = useAuth();
  const { showToast } = useShop();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      const res = await getAssignedDeliveryOrdersApi();
      if (res.data?.success && Array.isArray(res.data.data)) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching delivery orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await updateDeliveryStatusApi(orderId, { status: newStatus });
      if (res.data?.success) {
        showToast(res.data.message || `✓ Order status updated to "${newStatus}"`, "success");
        fetchAssignedOrders();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update delivery status", "error");
    }
  };

  const completedCount = orders.filter((o) => o.orderStatus === "Delivered").length;
  const pendingCount = orders.filter((o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled").length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 space-y-6 text-xs max-w-3xl mx-auto pb-16">
      {/* Mobile Header Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-sm tracking-tight">{user?.name || "Delivery Partner"}</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Express Delivery Agent
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-400 font-bold rounded-xl transition-colors"
          title="Log Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* 2 Simple Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="text-slate-400 font-bold text-[10px] uppercase">Active Deliveries</div>
          <div className="text-xl font-black text-amber-600 mt-0.5">{pendingCount}</div>
          <div className="text-[10px] text-slate-400">Ready / In Transit</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="text-slate-400 font-bold text-[10px] uppercase">Delivered Today</div>
          <div className="text-xl font-black text-emerald-700 mt-0.5">{completedCount}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">Completed Trips</div>
        </div>
      </div>

      {/* Assigned Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-green-600" />
            <span>My Assigned Delivery Orders ({orders.length})</span>
          </h2>
          <button onClick={fetchAssignedOrders} className="text-xs font-bold text-green-600 hover:underline">
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
            <span>Loading delivery queue...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-100 text-center text-slate-400">
            No assigned deliveries in your queue right now.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const isDelivered = o.orderStatus === "Delivered";
              const isOutForDelivery = o.orderStatus === "Out for Delivery";
              const address = o.shippingAddress;
              const fullAddressString = `${address?.addressLine || ""}, ${address?.city || ""}, ${address?.pincode || ""}`;
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressString)}`;

              return (
                <div
                  key={o._id}
                  className={`p-5 rounded-3xl border transition-all space-y-4 ${
                    isDelivered
                      ? "bg-slate-50 border-slate-200 opacity-60"
                      : isOutForDelivery
                      ? "bg-emerald-50/40 border-emerald-300 shadow-md"
                      : "bg-white border-slate-100 shadow-xs"
                  }`}
                >
                  {/* Top Bar: Order Number & Status */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="font-mono font-black text-sm text-slate-900">{o.orderNumber}</span>
                      <span className="text-slate-400 ml-2">({o.items?.length || 1} items)</span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        isDelivered
                          ? "bg-emerald-100 text-emerald-800"
                          : isOutForDelivery
                          ? "bg-blue-100 text-blue-800 animate-pulse"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {o.orderStatus}
                    </span>
                  </div>

                  {/* Customer Info & Address */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                      <span>{address?.fullName || o.user?.name || "Customer"}</span>
                      {address?.phone && (
                        <a
                          href={`tel:${address.phone}`}
                          className="bg-green-600 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-green-700 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div>{address?.addressLine}</div>
                        <div className="text-slate-400 text-[11px]">{address?.city}, {address?.pincode}</div>
                      </div>

                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 shrink-0"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                        <span>Maps</span>
                      </a>
                    </div>
                  </div>

                  {/* Payment Details & COD Indicator */}
                  <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold">Collect Amount: </span>
                      <strong className="text-slate-900 font-black text-sm">₹{o.totalAmount}</strong>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                      o.paymentMethod === "COD" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {o.paymentMethod} • {o.paymentStatus}
                    </span>
                  </div>

                  {/* Action Buttons for Delivery Agent */}
                  {!isDelivered && (
                    <div className="flex gap-2 pt-1">
                      {!isOutForDelivery && (
                        <button
                          onClick={() => handleUpdateStatus(o._id, "Out for Delivery")}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Start Trip (Out for Delivery)</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleUpdateStatus(o._id, "Delivered")}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Delivered & Collect ₹{o.totalAmount}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
