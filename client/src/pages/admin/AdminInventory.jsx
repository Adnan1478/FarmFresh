import React, { useState, useEffect } from "react";
import {
  Boxes,
  AlertTriangle,
  Clock,
  TrendingUp,
  Trash2,
  Plus,
  Truck,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle,
  Loader2,
  Tag,
  Sparkles,
  RefreshCw,
  Search,
  UserCheck
} from "lucide-react";
import {
  getInventorySummaryApi,
  getLowStockAlertsApi,
  getExpiringBatchesApi,
  getStockMovementsApi,
  getAllBatchesApi,
  createBatchApi,
  deleteBatchApi,
  getAllWasteRecordsApi,
  recordWasteApi,
  getAllSuppliersApi,
  createSupplierApi,
  getAllPurchaseOrdersApi,
  createPurchaseOrderApi,
  receivePurchaseOrderApi
} from "../../api/inventoryApi";
import { useShop } from "../../context/ShopContext";

export default function AdminInventory() {
  const { products, showToast } = useShop();

  const [activeTab, setActiveTab] = useState("overview");

  // Summary Metrics
  const [metrics, setMetrics] = useState({
    totalStockQty: 0,
    totalInventoryValue: 0,
    lowStockCount: 0,
    expiringSoonCount: 0,
    todayPurchaseValue: 0,
    todayWasteLoss: 0
  });

  // Data lists
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [expiringBatches, setExpiringBatches] = useState([]);
  const [batches, setBatches] = useState([]);
  const [movements, setMovements] = useState([]);
  const [wasteRecords, setWasteRecords] = useState([]);
  const [totalWasteLoss, setTotalWasteLoss] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Form States
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [batchForm, setBatchForm] = useState({
    product: "",
    batchNumber: "",
    supplier: "",
    quantityReceived: "",
    costPrice: "",
    expiryDate: ""
  });

  const [showWasteModal, setShowWasteModal] = useState(false);
  const [wasteForm, setWasteForm] = useState({
    product: "",
    batch: "",
    quantity: "",
    reason: "Spoiled",
    notes: ""
  });

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    address: ""
  });

  const [showPOModal, setShowPOModal] = useState(false);
  const [poForm, setPoForm] = useState({
    supplier: "",
    items: [{ product: "", quantityOrdered: "", unitPrice: "" }],
    expectedDeliveryDate: ""
  });

  // Fetch all inventory data from MongoDB
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [sumRes, lowRes, expRes, batchRes, movRes, wasteRes, supRes, poRes] = await Promise.all([
        getInventorySummaryApi(),
        getLowStockAlertsApi(),
        getExpiringBatchesApi(),
        getAllBatchesApi(),
        getStockMovementsApi(),
        getAllWasteRecordsApi(),
        getAllSuppliersApi(),
        getAllPurchaseOrdersApi()
      ]);

      if (sumRes.data?.success) setMetrics(sumRes.data.data);
      if (lowRes.data?.success) setLowStockAlerts(lowRes.data.data);
      if (expRes.data?.success) setExpiringBatches(expRes.data.data);
      if (batchRes.data?.success) setBatches(batchRes.data.data);
      if (movRes.data?.success) setMovements(movRes.data.data);
      if (wasteRes.data?.success) {
        setWasteRecords(wasteRes.data.data);
        setTotalWasteLoss(wasteRes.data.totalLossAmount || 0);
      }
      if (supRes.data?.success) setSuppliers(supRes.data.data);
      if (poRes.data?.success) setPurchaseOrders(poRes.data.data);
    } catch (err) {
      console.error("Error loading inventory dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Submit Add Batch Form
  const handleAddBatch = async (e) => {
    e.preventDefault();
    try {
      const res = await createBatchApi(batchForm);
      if (res.data?.success) {
        showToast("✓ Inventory batch created & stock updated!", "success");
        setShowAddBatchModal(false);
        setBatchForm({ product: "", batchNumber: "", supplier: "", quantityReceived: "", costPrice: "", expiryDate: "" });
        fetchAllData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add batch", "error");
    }
  };

  // Submit Record Waste Form
  const handleRecordWaste = async (e) => {
    e.preventDefault();
    try {
      const res = await recordWasteApi(wasteForm);
      if (res.data?.success) {
        showToast(res.data.message || "✓ Produce waste recorded!", "success");
        setShowWasteModal(false);
        setWasteForm({ product: "", batch: "", quantity: "", reason: "Spoiled", notes: "" });
        fetchAllData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to record waste", "error");
    }
  };

  // Submit Add Supplier Form
  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      const res = await createSupplierApi(supplierForm);
      if (res.data?.success) {
        showToast("✓ Farm supplier added!", "success");
        setShowSupplierModal(false);
        setSupplierForm({ name: "", companyName: "", phone: "", email: "", address: "" });
        fetchAllData();
      }
    } catch (err) {
      showToast("Failed to add supplier", "error");
    }
  };

  // Submit Create PO Form
  const handleCreatePO = async (e) => {
    e.preventDefault();
    try {
      const res = await createPurchaseOrderApi(poForm);
      if (res.data?.success) {
        showToast(res.data.message || "✓ Purchase order created!", "success");
        setShowPOModal(false);
        setPoForm({ supplier: "", items: [{ product: "", quantityOrdered: "", unitPrice: "" }], expectedDeliveryDate: "" });
        fetchAllData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create PO", "error");
    }
  };

  // Receive Purchase Order into Inventory (Auto creates Batches)
  const handleReceivePO = async (poId) => {
    if (window.confirm("Receive this Purchase Order into inventory? This will automatically generate stock batches.")) {
      try {
        const res = await receivePurchaseOrderApi(poId);
        if (res.data?.success) {
          showToast(res.data.message || "✓ PO received into inventory!", "success");
          fetchAllData();
        }
      } catch (err) {
        showToast("Failed to receive PO", "error");
      }
    }
  };

  // Delete Batch
  const handleDeleteBatch = async (batchId) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      try {
        await deleteBatchApi(batchId);
        showToast("Batch deleted", "info");
        fetchAllData();
      } catch (err) {
        showToast("Failed to delete batch", "error");
      }
    }
  };

  return (
    <div className="space-y-8 pb-16 text-xs">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-green-600" />
            <span>FarmFresh Advanced Inventory & Supply Chain</span>
          </h1>
          <p className="text-slate-500 mt-0.5">
            FEFO stock batching, reorder rules, waste tracking, suppliers & purchase orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddBatchModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Batch</span>
          </button>
          <button
            onClick={() => setShowWasteModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Record Waste Loss</span>
          </button>
        </div>
      </div>

      {/* 6 Metric Summary Cards (Matching Architecture Diagram) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total Stock</div>
          <div className="text-xl font-black text-slate-900">{metrics.totalStockQty} kg/units</div>
          <div className="text-[10px] text-green-600 font-semibold">In Storage</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Low Stock</div>
          <div className="text-xl font-black text-amber-600">{metrics.lowStockCount}</div>
          <div className="text-[10px] text-amber-700 font-semibold">Below Reorder Level</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Expiring Soon</div>
          <div className="text-xl font-black text-red-600">{metrics.expiringSoonCount}</div>
          <div className="text-[10px] text-red-700 font-semibold">Within 7 Days (FEFO)</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Today's Purchases</div>
          <div className="text-xl font-black text-slate-900">₹{metrics.todayPurchaseValue}</div>
          <div className="text-[10px] text-slate-400 font-semibold">PO Received</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Today's Waste Loss</div>
          <div className="text-xl font-black text-red-600">₹{metrics.todayWasteLoss}</div>
          <div className="text-[10px] text-red-700 font-semibold">Spoiled / Damaged</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Inventory Value</div>
          <div className="text-xl font-black text-emerald-700">₹{metrics.totalInventoryValue}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">At Cost Price</div>
        </div>
      </div>

      {/* Main Tabbed Navigation */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
        <div className="flex border-b border-slate-100 gap-6 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "overview" ? "border-green-600 text-green-600" : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Overview & Low Stock</span>
          </button>

          <button
            onClick={() => setActiveTab("batches")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "batches" ? "border-green-600 text-green-600" : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Stock Batches ({batches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("movements")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "movements" ? "border-green-600 text-green-600" : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Stock Movements Audit</span>
          </button>

          <button
            onClick={() => setActiveTab("waste")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "waste" ? "border-green-600 text-green-600" : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            <span>Waste Loss ({wasteRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("suppliers")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "suppliers" ? "border-green-600 text-green-600" : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Farm Suppliers ({suppliers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("pos")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "pos" ? "border-green-600 text-green-600" : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Purchase Orders ({purchaseOrders.length})</span>
          </button>
        </div>

        {/* Tab 1: Overview & Low Stock / FEFO Expiring */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Alerts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Low Stock Reorder Alerts</span>
                </h3>
                <span className="text-[11px] text-amber-700 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full">
                  {lowStockAlerts.length} Needs Attention
                </span>
              </div>

              {lowStockAlerts.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-500">
                  All produce stock levels are healthy!
                </div>
              ) : (
                <div className="space-y-2">
                  {lowStockAlerts.map((item) => (
                    <div
                      key={item._id}
                      className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{item.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Current Stock: <span className="font-bold text-slate-900">{item.currentStock} {item.unit}</span> (Min: {item.minimumStock} {item.unit})
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="bg-amber-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg">
                          Reorder +{item.suggestedReorderQty} {item.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expiring Soon FEFO Batches */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span>Expiring Soon Produce (FEFO Priority)</span>
                </h3>
                <span className="text-[11px] text-red-700 font-bold bg-red-100 px-2.5 py-0.5 rounded-full">
                  {expiringBatches.length} Batches
                </span>
              </div>

              {expiringBatches.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-500">
                  No batches expiring within 7 days.
                </div>
              ) : (
                <div className="space-y-2">
                  {expiringBatches.map((b) => (
                    <div
                      key={b._id}
                      className="p-3.5 bg-red-50/40 rounded-2xl border border-red-200/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{b.product?.name || "Product"}</div>
                        <div className="text-[11px] text-slate-500">
                          Batch: <span className="font-mono font-bold text-slate-700">{b.batchNumber}</span> • Available: <span className="font-bold text-slate-900">{b.quantityAvailable} {b.product?.unit}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-red-600 font-black text-xs">
                          Expires: {new Date(b.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Batches Management */}
        {activeTab === "batches" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm">Physical Stock Batches</h3>
              <button
                onClick={() => setShowAddBatchModal(true)}
                className="bg-green-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Batch</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-3">Batch No</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3">Received Date</th>
                    <th className="p-3">Expiry Date</th>
                    <th className="p-3">Available / Received</th>
                    <th className="p-3">Cost Price</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {batches.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{b.batchNumber}</td>
                      <td className="p-3 font-bold">{b.product?.name}</td>
                      <td className="p-3 text-slate-500">{b.supplier?.name || "N/A"}</td>
                      <td className="p-3 text-slate-400">{new Date(b.receivedDate).toLocaleDateString()}</td>
                      <td className="p-3 text-red-600 font-bold">{b.expiryDate ? new Date(b.expiryDate).toLocaleDateString() : "N/A"}</td>
                      <td className="p-3 font-bold text-emerald-700">{b.quantityAvailable} / {b.quantityReceived} {b.product?.unit}</td>
                      <td className="p-3 font-bold">₹{b.costPrice}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === "AVAILABLE" ? "bg-emerald-100 text-emerald-800" :
                          b.status === "LOW_STOCK" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => handleDeleteBatch(b._id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Stock Movements Audit Trail */}
        {activeTab === "movements" && (
          <div className="space-y-4">
            <h3 className="font-black text-slate-900 text-sm">Audit Trail of Stock Transactions</h3>

            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Batch</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Reason / Details</th>
                    <th className="p-3">Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {movements.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-400">{new Date(m.createdAt).toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.type === "PURCHASE" ? "bg-emerald-100 text-emerald-800" :
                          m.type === "SALE" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                        }`}>
                          {m.type}
                        </span>
                      </td>
                      <td className="p-3 font-bold">{m.product?.name}</td>
                      <td className="p-3 font-mono text-slate-500">{m.batch?.batchNumber || "N/A"}</td>
                      <td className={`p-3 font-bold ${m.quantity > 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity} {m.product?.unit}
                      </td>
                      <td className="p-3 text-slate-600">{m.reason}</td>
                      <td className="p-3 text-slate-500">{m.createdBy?.name || "System"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Waste Management */}
        {activeTab === "waste" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Produce Waste Loss Audit</h3>
                <p className="text-slate-500 text-[11px]">Total Loss: <span className="font-bold text-red-600">₹{totalWasteLoss}</span></p>
              </div>
              <button
                onClick={() => setShowWasteModal(true)}
                className="bg-red-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Waste</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Batch</th>
                    <th className="p-3">Quantity Lost</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Cost Loss</th>
                    <th className="p-3">Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {wasteRecords.map((w) => (
                    <tr key={w._id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-400">{new Date(w.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 font-bold">{w.product?.name}</td>
                      <td className="p-3 font-mono text-slate-500">{w.batch?.batchNumber}</td>
                      <td className="p-3 font-bold text-red-600">{w.quantity} {w.product?.unit}</td>
                      <td className="p-3 font-bold text-amber-700">{w.reason}</td>
                      <td className="p-3 font-black text-red-600">₹{w.costLoss}</td>
                      <td className="p-3 text-slate-500">{w.recordedBy?.name || "Admin"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Suppliers Directory */}
        {activeTab === "suppliers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm">Certified Farm Suppliers</h3>
              <button
                onClick={() => setShowSupplierModal(true)}
                className="bg-green-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Supplier</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {suppliers.map((s) => (
                <div key={s._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                  <div className="text-emerald-700 font-semibold text-xs">{s.companyName}</div>
                  <div className="text-slate-500 text-xs">Phone: {s.phone}</div>
                  <div className="text-slate-400 text-xs">{s.email || "No email"}</div>
                  <div className="text-slate-500 text-[11px] mt-1">{s.address}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Purchase Orders */}
        {activeTab === "pos" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm">Supplier Purchase Orders (POs)</h3>
              <button
                onClick={() => setShowPOModal(true)}
                className="bg-green-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Purchase Order</span>
              </button>
            </div>

            <div className="space-y-3">
              {purchaseOrders.map((po) => (
                <div key={po._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-900 text-sm">{po.poNumber}</span>
                      <span className="text-slate-500 ml-2">• Supplier: <strong>{po.supplier?.name}</strong></span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        po.status === "RECEIVED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {po.status}
                      </span>

                      {po.status !== "RECEIVED" && (
                        <button
                          onClick={() => handleReceivePO(po._id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Mark Received into Stock</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-slate-600">
                    Total PO Amount: <strong className="text-slate-900 font-black">₹{po.totalAmount}</strong> • Ordered Date: {new Date(po.orderedDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Batch Modal */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setShowAddBatchModal(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" />
          <form onSubmit={handleAddBatch} className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 z-10 border border-slate-100 text-xs">
            <h3 className="font-black text-slate-900 text-base">Add New Produce Stock Batch</h3>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Select Product *</label>
              <select
                required
                value={batchForm.product}
                onChange={(e) => setBatchForm({ ...batchForm, product: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
              >
                <option value="">-- Choose Product --</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} ({p.unit})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Quantity Received *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50"
                  value={batchForm.quantityReceived}
                  onChange={(e) => setBatchForm({ ...batchForm, quantityReceived: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Cost Price (per unit) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 25"
                  value={batchForm.costPrice}
                  onChange={(e) => setBatchForm({ ...batchForm, costPrice: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Expiry Date (FEFO)</label>
              <input
                type="date"
                value={batchForm.expiryDate}
                onChange={(e) => setBatchForm({ ...batchForm, expiryDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setShowAddBatchModal(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-green-600 text-white font-bold rounded-xl shadow-md">Add Batch</button>
            </div>
          </form>
        </div>
      )}

      {/* Record Waste Modal */}
      {showWasteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setShowWasteModal(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" />
          <form onSubmit={handleRecordWaste} className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 z-10 border border-slate-100 text-xs">
            <h3 className="font-black text-slate-900 text-base">Record Produce Waste Loss</h3>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Select Product *</label>
              <select
                required
                value={wasteForm.product}
                onChange={(e) => setWasteForm({ ...wasteForm, product: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
              >
                <option value="">-- Choose Product --</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} ({p.unit})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Waste Quantity *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5"
                  value={wasteForm.quantity}
                  onChange={(e) => setWasteForm({ ...wasteForm, quantity: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reason</label>
                <select
                  value={wasteForm.reason}
                  onChange={(e) => setWasteForm({ ...wasteForm, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                >
                  <option value="Spoiled">Spoiled</option>
                  <option value="Overripe">Overripe</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setShowWasteModal(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-red-600 text-white font-bold rounded-xl shadow-md">Record Loss</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setShowSupplierModal(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" />
          <form onSubmit={handleAddSupplier} className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 z-10 border border-slate-100 text-xs">
            <h3 className="font-black text-slate-900 text-base">Add New Farm Supplier</h3>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Supplier / Contact Person Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={supplierForm.name}
                onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Company / Farm Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Green Acres Organic Farms"
                value={supplierForm.companyName}
                onChange={(e) => setSupplierForm({ ...supplierForm, companyName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Phone Number (10 Digits) *</label>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="e.g. 9876543210"
                value={supplierForm.phone}
                onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Email Address</label>
              <input
                type="email"
                placeholder="e.g. supplier@farm.com"
                value={supplierForm.email}
                onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setShowSupplierModal(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-green-600 text-white font-bold rounded-xl shadow-md">Add Supplier</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
