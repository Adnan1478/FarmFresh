import React, { useState, useEffect } from "react";
import {
  PackageCheck,
  Search,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Eye,
  Loader2,
  MapPin,
  User,
  Phone,
  Calendar,
  AlertCircle
} from "lucide-react";
import { getAllOrdersApi, updateOrderStatusApi, cancelOrderApi } from "../../api/orderApi";
import { useShop } from "../../context/ShopContext";

export default function AdminOrders() {
  const { showToast } = useShop();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Detail State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrdersApi({ status: statusFilter, search: searchQuery });
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      showToast("Error loading order list from server", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatusApi(orderId, { orderStatus: newStatus });
      if (res.data?.success) {
        showToast(`✓ Order status updated to "${newStatus}"`, "success");
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(res.data.data);
        }
      }
    } catch (err) {
      showToast(err.message || "Failed to update order status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this customer order?")) {
      setUpdatingId(orderId);
      try {
        const res = await cancelOrderApi(orderId);
        if (res.data?.success) {
          showToast("Order cancelled successfully", "info");
          fetchOrders();
          if (selectedOrder && selectedOrder._id === orderId) {
            setSelectedOrder(res.data.data);
          }
        }
      } catch (err) {
        showToast(err.message || "Failed to cancel order", "error");
      } finally {
        setUpdatingId(null);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Confirmed":
        return (
          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Confirmed
          </span>
        );
      case "Processing":
        return (
          <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3 animate-spin" /> Processing
          </span>
        );
      case "Out for Delivery":
        return (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Truck className="w-3 h-3" /> Out for Delivery
          </span>
        );
      case "Delivered":
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Delivered
          </span>
        );
      case "Cancelled":
        return (
          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-green-600" />
            <span>Order Manipulation & Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View, track, update order statuses, and manipulate delivery workflows.
          </p>
        </div>
      </div>

      {/* Filter Pills & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto text-xs font-bold py-1">
          {["all", "Confirmed", "Processing", "Out for Delivery", "Delivered", "Cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {st === "all" ? "All Orders" : st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search order # or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 outline-none focus:border-green-600 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 gap-3">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Loading orders from database...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
          <PackageCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Orders Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No orders match the selected filter or search criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items Count</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4 text-right">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="font-black text-slate-900 hover:text-green-600 transition-colors"
                      >
                        {order.orderNumber}
                      </button>
                      <div className="text-[10px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-900">
                        {order.shippingAddress?.fullName || order.user?.name || "Customer"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {order.shippingAddress?.phone || order.user?.phone}
                      </div>
                    </td>

                    <td className="p-4 font-bold">{order.items?.length || 0} items</td>

                    <td className="p-4 font-black text-slate-900">₹{order.totalAmount}</td>

                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        {order.paymentMethod} ({order.paymentStatus})
                      </span>
                    </td>

                    <td className="p-4">{getStatusBadge(order.orderStatus)}</td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Status Select Manipulator */}
                        <select
                          value={order.orderStatus}
                          disabled={updatingId === order._id || order.orderStatus === "Cancelled"}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-[11px] font-bold rounded-xl p-1.5 outline-none focus:border-green-600"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-slate-600 hover:text-green-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" />

          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 z-10 border border-slate-100 animate-slideUp text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 text-lg">Order #{selectedOrder.orderNumber}</h3>
                  {getStatusBadge(selectedOrder.orderStatus)}
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <User className="w-4 h-4 text-green-600" />
                  <span>Customer Details</span>
                </div>
                <div className="text-slate-700 font-semibold">{selectedOrder.shippingAddress?.fullName}</div>
                <div className="text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{selectedOrder.shippingAddress?.phone}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span>Delivery Address</span>
                </div>
                <div className="text-slate-600 leading-relaxed">
                  {selectedOrder.shippingAddress?.addressLine}, {selectedOrder.shippingAddress?.city},{" "}
                  {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900">Ordered Items ({selectedOrder.items?.length})</h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=100&q=80"}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-xl border border-slate-200 shrink-0 bg-white"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-400">₹{item.price} x {item.quantity}</div>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900">₹{item.subtotal}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown & Status Change Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="space-y-1 text-xs w-full sm:w-auto">
                <div className="text-slate-500">Subtotal: <span className="font-bold text-slate-800">₹{selectedOrder.subtotal}</span></div>
                <div className="text-slate-500">Delivery Charge: <span className="font-bold text-slate-800">₹{selectedOrder.deliveryCharge}</span></div>
                <div className="text-slate-900 font-black text-sm pt-1">Total Amount: ₹{selectedOrder.totalAmount}</div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {selectedOrder.orderStatus !== "Cancelled" && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder._id)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs transition-colors"
                  >
                    Cancel Order
                  </button>
                )}

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
