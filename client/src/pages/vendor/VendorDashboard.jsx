import React, { useState, useEffect } from "react";
import {
  Sprout,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  PackageCheck,
  Loader2,
  Leaf,
  LogOut,
  UserCheck
} from "lucide-react";
import { getVendorDashboardApi, submitHarvestBatchApi } from "../../api/vendorApi";
import { useAuth } from "../../context/AuthContext";
import { useShop } from "../../context/ShopContext";

export default function VendorDashboard() {
  const { user, logout } = useAuth();
  const { categories, showToast } = useShop();

  const [metrics, setMetrics] = useState({
    totalSuppliedKg: 0,
    totalEarnings: 0,
    pendingPayout: 0,
    pendingInspections: 0
  });

  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const [form, setForm] = useState({
    produceName: "",
    category: "",
    harvestDate: "",
    quantityHarvested: "",
    unit: "kg",
    pricePerUnit: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getVendorDashboardApi();
      if (res.data?.success && res.data?.data) {
        setMetrics(res.data.data);
        setSupplies(res.data.data.supplies || []);
      }
    } catch (err) {
      console.error("Error loading vendor dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitHarvest = async (e) => {
    e.preventDefault();
    try {
      const res = await submitHarvestBatchApi(form);
      if (res.data?.success) {
        showToast("✓ Harvest shipment submitted for warehouse quality check!", "success");
        setShowSubmitModal(false);
        setForm({
          produceName: "",
          category: "",
          harvestDate: "",
          quantityHarvested: "",
          unit: "kg",
          pricePerUnit: ""
        });
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to submit harvest shipment", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 space-y-8 text-xs max-w-6xl mx-auto">
      {/* Top Header & Session Bar */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-md">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight">{user?.name || "Farmer Partner"}</h1>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Certified Vendor
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">FarmFresh Produce Supplier Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Harvest Batch</span>
          </button>

          <button
            onClick={logout}
            className="p-2.5 bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-400 font-bold rounded-xl transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total Harvest Supplied</div>
          <div className="text-2xl font-black text-slate-900">{metrics.totalSuppliedKg} kg</div>
          <div className="text-[10px] text-green-600 font-semibold">Accepted Shipments</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Paid Earnings</div>
          <div className="text-2xl font-black text-emerald-700">₹{metrics.totalEarnings}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">Bank Settled</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Pending Payouts</div>
          <div className="text-2xl font-black text-amber-600">₹{metrics.pendingPayout}</div>
          <div className="text-[10px] text-amber-700 font-semibold">Accepted & Awaiting Payment</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Pending Quality Check</div>
          <div className="text-2xl font-black text-blue-600">{metrics.pendingInspections}</div>
          <div className="text-[10px] text-blue-700 font-semibold">At Warehouse</div>
        </div>
      </div>

      {/* Harvest Shipments History Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-slate-900 text-base">Harvest Shipments & Payout Status ({supplies.length})</h2>
          <button
            onClick={fetchData}
            className="text-xs font-bold text-green-600 hover:underline"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
            <span>Loading shipments...</span>
          </div>
        ) : supplies.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No harvest shipments submitted yet. Click "Submit Harvest Batch" above!
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-3">Harvest Date</th>
                  <th className="p-3">Produce Name</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Price / Unit</th>
                  <th className="p-3">Total Payout</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Quality Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {supplies.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-400">{new Date(s.harvestDate).toLocaleDateString()}</td>
                    <td className="p-3 font-bold text-slate-900">{s.produceName}</td>
                    <td className="p-3 font-bold text-emerald-700">{s.quantityHarvested} {s.unit}</td>
                    <td className="p-3 font-bold">₹{s.pricePerUnit} / {s.unit}</td>
                    <td className="p-3 font-black text-slate-900">₹{s.totalPayout}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === "PAID" ? "bg-emerald-100 text-emerald-800" :
                        s.status === "ACCEPTED" ? "bg-blue-100 text-blue-800" :
                        s.status === "PENDING_INSPECTION" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                      }`}>
                        {s.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{s.qualityNotes || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit Harvest Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setShowSubmitModal(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" />
          <form
            onSubmit={handleSubmitHarvest}
            className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 z-10 border border-slate-100 text-xs"
          >
            <h3 className="font-black text-slate-900 text-base">Submit Harvest Produce Shipment</h3>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Produce Name (e.g. Organic Tomatoes) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Fresh Red Tomatoes"
                value={form.produceName}
                onChange={(e) => setForm({ ...form, produceName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Harvest Date</label>
                <input
                  type="date"
                  value={form.harvestDate}
                  onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Quantity Harvested (kg) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 100"
                  value={form.quantityHarvested}
                  onChange={(e) => setForm({ ...form, quantityHarvested: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Agreed Price per kg (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 25"
                  value={form.pricePerUnit}
                  onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md"
              >
                Submit Shipment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
