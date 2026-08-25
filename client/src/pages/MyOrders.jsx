import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PackageCheck, Clock, CheckCircle, Truck, XCircle, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { getMyOrdersApi, cancelOrderApi } from "../api/orderApi";
import { useShop } from "../context/ShopContext";
import EmptyState from "../components/EmptyState";

export default function MyOrders() {
  const { showToast } = useShop();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const res = await getMyOrdersApi();
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      showToast("Error loading order history", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await cancelOrderApi(orderId);
        showToast("✓ Order cancelled successfully", "info");
        fetchMyOrders();
      } catch (err) {
        showToast(err.message || "Unable to cancel order", "error");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Confirmed":
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Order Confirmed
          </span>
        );
      case "Processing":
        return (
          <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 animate-spin" /> Processing
          </span>
        );
      case "Out for Delivery":
        return (
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 animate-bounceCustom" /> Out for Delivery
          </span>
        );
      case "Delivered":
        return (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case "Cancelled":
        return (
          <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 gap-3">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">Fetching your order history from server...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No Orders Yet"
        description="You haven't placed any orders with FarmFresh yet. Explore our fresh organic vegetables and fruits!"
        actionText="Browse Fresh Produce"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Order History</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track active deliveries and past produce purchases</p>
        </div>

        <button
          onClick={fetchMyOrders}
          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-green-600 transition-colors shadow-xs"
          title="Refresh Orders"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-slate-900 text-base">#{order.orderNumber}</h3>
                  {getStatusBadge(order.orderStatus)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400 font-medium">Total Amount</div>
                <div className="text-lg font-black text-slate-900">₹{order.totalAmount}</div>
              </div>
            </div>

            {/* Items Thumbnails */}
            <div className="flex flex-wrap items-center gap-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 text-xs">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=100&q=80"}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded-xl border border-slate-200 shrink-0 bg-white"
                  />
                  <div>
                    <div className="font-bold text-slate-800 text-xs truncate max-w-[120px]">{item.name}</div>
                    <div className="text-[11px] text-slate-500">₹{item.price} × {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer & Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="text-slate-500">
                Payment: <span className="font-bold text-slate-800">{order.paymentMethod}</span> ({order.paymentStatus})
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {(order.orderStatus === "Confirmed" || order.orderStatus === "Processing" || order.orderStatus === "Pending") && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors"
                  >
                    Cancel Order
                  </button>
                )}

                <Link
                  to={`/order-success/${order._id}`}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-1 transition-colors"
                >
                  <span>View Summary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
