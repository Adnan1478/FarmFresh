import React, { useState, useEffect } from "react";
import {
  Sprout,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Search,
  Filter,
  Loader2,
  PackageCheck,
  User,
  Calendar,
  AlertCircle
} from "lucide-react";
import { getVendorSuppliesApi, updateSupplyStatusApi } from "../../api/vendorApi";
import { getProductsApi } from "../../api/productApi";
import { useShop } from "../../context/ShopContext";

export default function AdminVendorSupplies() {
  const { showToast } = useShop();

  const [supplies, setSupplies] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Inspection Action Modal state
  const [selectedSupply, setSelectedSupply] = useState(null);
  const [actionForm, setActionForm] = useState({
    status: "ACCEPTED",
    qualityNotes: "",
    productId: ""
  });
  const [updating, setUpdating] = useState(false);

  const fetchSupplies = async () => {
    try {
      setLoading(true);
      const [suppliesRes, productsRes] = await Promise.all([
        getVendorSuppliesApi(),
        getProductsApi()
      ]);

      if (suppliesRes.data?.success && Array.isArray(suppliesRes.data.data)) {
        setSupplies(suppliesRes.data.data);
      }
      if (productsRes.data?.success && Array.isArray(productsRes.data.data)) {
        setProducts(productsRes.data.data);
      }
    } catch (err) {
      console.error("Error loading vendor supplies:", err);
      showToast("Error loading vendor supplies from server", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplies();
  }, []);

  const handleOpenActionModal = (supply) => {
    setSelectedSupply(supply);
    setActionForm({
      status: supply.status === "PENDING_INSPECTION" ? "ACCEPTED" : supply.status,
      qualityNotes: supply.qualityNotes || "",
      productId: ""
    });
  };

  const handleSubmitAction = async (e) => {
    e.preventDefault();
    if (!selectedSupply) return;

    try {
      setUpdating(true);
      const res = await updateSupplyStatusApi(selectedSupply._id, actionForm);
      if (res.data?.success) {
        showToast(`✓ Harvest shipment status updated to "${actionForm.status.replace("_", " ")}"`, "success");
        setSelectedSupply(null);
        fetchSupplies();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update supply status", "error");
    } finally {
      setUpdating(false);
    }
  };

  const filteredSupplies = supplies.filter((s) => {
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesSearch =
      s.produceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalKg = supplies.reduce((acc, s) => acc + (s.status === "ACCEPTED" || s.status === "PAID" ? s.quantityHarvested : 0), 0);
  const pendingCount = supplies.filter((s) => s.status === "PENDING_INSPECTION").length;
  const pendingPayoutTotal = supplies.reduce((acc, s) => acc + (s.status === "ACCEPTED" ? s.totalPayout : 0), 0);
  const paidTotal = supplies.reduce((acc, s) => acc + (s.status === "PAID" ? s.totalPayout : 0), 0);

  return (
    <div className="space-y-8 pb-16 text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Sprout className="w-6 h-6 text-green-600" />
            <span>Vendor Harvest & Quality Inspections</span>
          </h1>
          <p className="text-slate-500 mt-0.5">
            Inspect incoming farmer produce, perform quality checks, generate inventory batches & process settlements.
          </p>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Accepted Produce Volume</div>
          <div className="text-2xl font-black text-slate-900">{totalKg} kg</div>
          <div className="text-[10px] text-green-600 font-semibold">Warehouse Stocked</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Pending Quality Checks</div>
          <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
          <div className="text-[10px] text-amber-700 font-semibold">Awaiting Inspection</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Approved Payout Liability</div>
          <div className="text-2xl font-black text-blue-600">₹{pendingPayoutTotal}</div>
          <div className="text-[10px] text-blue-700 font-semibold">Ready for Bank Settlement</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Settled Payouts</div>
          <div className="text-2xl font-black text-emerald-700">₹{paidTotal}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">Total Paid to Farmers</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto text-xs font-bold py-1">
          {[
            { id: "all", label: "All Harvests" },
            { id: "PENDING_INSPECTION", label: "Pending Inspection" },
            { id: "ACCEPTED", label: "Accepted" },
            { id: "PAID", label: "Settled (Paid)" },
            { id: "REJECTED", label: "Rejected" }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                statusFilter === st.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search produce or farmer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 outline-none focus:border-green-600 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Harvest Shipments Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <h2 className="font-black text-slate-900 text-base">Incoming Farmer Harvest Shipments ({filteredSupplies.length})</h2>

        {loading ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
            <span>Loading harvest shipments...</span>
          </div>
        ) : filteredSupplies.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No vendor harvest shipments match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-3">Farmer / Vendor</th>
                  <th className="p-3">Produce Item</th>
                  <th className="p-3">Harvest Date</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Agreed Price</th>
                  <th className="p-3">Total Payout</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Quality Check Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredSupplies.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{s.vendor?.name || "Farmer Partner"}</div>
                      <div className="text-[10px] text-slate-400">{s.vendor?.phone || s.vendor?.email}</div>
                    </td>

                    <td className="p-3 font-bold text-slate-900">
                      <div>{s.produceName}</div>
                      {s.category?.name && (
                        <div className="text-[10px] text-green-600 font-semibold">{s.category.name}</div>
                      )}
                    </td>

                    <td className="p-3 text-slate-400">{new Date(s.harvestDate).toLocaleDateString()}</td>
                    <td className="p-3 font-bold text-emerald-700">{s.quantityHarvested} {s.unit}</td>
                    <td className="p-3 font-bold">₹{s.pricePerUnit} / {s.unit}</td>
                    <td className="p-3 font-black text-slate-900">₹{s.totalPayout}</td>

                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === "PAID" ? "bg-emerald-100 text-emerald-800" :
                        s.status === "ACCEPTED" ? "bg-blue-100 text-blue-800" :
                        s.status === "PENDING_INSPECTION" ? "bg-amber-100 text-amber-800 animate-pulse" : "bg-red-100 text-red-800"
                      }`}>
                        {s.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleOpenActionModal(s)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                      >
                        Inspect / Action
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quality Check & Status Action Modal */}
      {selectedSupply && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setSelectedSupply(null)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" />

          <form
            onSubmit={handleSubmitAction}
            className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 z-10 border border-slate-100 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base">Warehouse Quality Inspection</h3>
              <span className="font-bold text-slate-400">{selectedSupply.produceName}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span>Farmer Partner:</span>
                <strong className="text-slate-900">{selectedSupply.vendor?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span>Shipment Volume:</span>
                <strong className="text-emerald-700">{selectedSupply.quantityHarvested} {selectedSupply.unit}</strong>
              </div>
              <div className="flex justify-between">
                <span>Calculated Payout:</span>
                <strong className="text-slate-900">₹{selectedSupply.totalPayout}</strong>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Quality Inspection Status *</label>
              <select
                value={actionForm.status}
                onChange={(e) => setActionForm({ ...actionForm, status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-900"
              >
                <option value="ACCEPTED">ACCEPTED (Pass Quality Check)</option>
                <option value="PAID">PAID (Settlement Complete)</option>
                <option value="REJECTED">REJECTED (Failed Quality Check)</option>
                <option value="PENDING_INSPECTION">PENDING INSPECTION</option>
              </select>
            </div>

            {actionForm.status === "ACCEPTED" && (
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Link Catalog Product (Auto-Create Inventory Batch)
                </label>
                <select
                  value={actionForm.productId}
                  onChange={(e) => setActionForm({ ...actionForm, productId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                >
                  <option value="">-- Select Catalog Product (Optional) --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock})</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Selecting a product automatically creates a new FEFO Stock Batch with {selectedSupply.quantityHarvested} {selectedSupply.unit}!
                </p>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-bold mb-1">Quality Inspection Notes</label>
              <textarea
                rows="3"
                placeholder="e.g. Grade A fresh produce, 0% spoilage observed during inspection."
                value={actionForm.qualityNotes}
                onChange={(e) => setActionForm({ ...actionForm, qualityNotes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedSupply(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Save Inspection</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
