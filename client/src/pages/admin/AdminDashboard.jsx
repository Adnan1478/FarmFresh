import React, { useState } from "react";
import { Link } from "react-router-dom";
import { DollarSign, Package, Users, AlertTriangle, TrendingUp, ArrowUpRight, Plus } from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { useShop } from "../../context/ShopContext";

export default function AdminDashboard() {
  const { products, orders, updateProductStock } = useShop();

  const salesOverviewData = [
    { month: "Jan", sales: 12000 },
    { month: "Feb", sales: 18000 },
    { month: "Mar", sales: 24500 },
    { month: "Apr", sales: 32000 },
    { month: "May", sales: 29000 },
    { month: "Jun", sales: 41000 }
  ];

  const categoryDistribution = [
    { name: "Vegetables", value: 45, color: "#16a34a" },
    { name: "Fruits", value: 30, color: "#f59e0b" },
    { name: "Fresh Juices", value: 15, color: "#2563eb" },
    { name: "Dried & Nuts", value: 10, color: "#8b5cf6" }
  ];

  const lowStockProducts = products.filter((p) => p.stock < 15);
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 24500);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 to-green-800 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Good afternoon, Admin 👋
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Here's what's happening with your FarmFresh store today.
          </p>
        </div>

        <Link
          to="/admin/products"
          className="bg-white text-emerald-900 font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 hover:bg-emerald-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Manage Inventory</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="w-9 h-9 bg-green-100 text-green-700 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-green-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{orders.length + 127}</div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            ● 86 pending delivery
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Customers</span>
            <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">1,482</div>
          <div className="text-[11px] text-slate-400">
            94% repeat purchase rate
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Alert</span>
            <div className="w-9 h-9 bg-red-100 text-red-700 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600">{lowStockProducts.length} Products</div>
          <div className="text-[11px] text-red-500 font-semibold">
            Action required below
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Store Sales Overview</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={salesOverviewData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#16a34a" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Share Pie Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Category Revenue Share</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {categoryDistribution.map((item, index) => (
                  <Cell key={index} fill={item.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Recent Orders & Low Stock Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Recent Customer Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-green-600 hover:underline">
              View All Orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-bold text-slate-800">#{o.orderNumber}</td>
                    <td className="py-3 text-slate-600">{o.shippingAddress.fullName}</td>
                    <td className="py-3 text-slate-500">{o.items.length} items</td>
                    <td className="py-3 font-bold text-slate-900">₹{o.totalAmount}</td>
                    <td className="py-3">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        {o.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts Widget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Low Stock Products
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{lowStockProducts.length} items</span>
          </div>

          <div className="space-y-3">
            {lowStockProducts.map((prod) => (
              <div
                key={prod._id}
                className="p-3 bg-red-50/60 rounded-2xl border border-red-100 flex items-center justify-between text-xs"
              >
                <div className="truncate pr-2">
                  <div className="font-bold text-slate-800 truncate">{prod.name}</div>
                  <div className="text-red-600 font-semibold">Stock: Only {prod.stock} {prod.unit}s left</div>
                </div>

                <button
                  onClick={() => updateProductStock(prod._id, prod.stock + 20)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] shrink-0 transition-colors shadow-xs"
                >
                  + Add Stock
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
