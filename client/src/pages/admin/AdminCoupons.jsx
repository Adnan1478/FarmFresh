import React, { useState, useEffect } from "react";
import {
  Tag,
  Plus,
  Clock,
  Trash2,
  Edit3,
  CheckCircle,
  AlertCircle,
  Percent,
  DollarSign,
  Calendar,
  Sparkles,
  Loader2,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import {
  getAllCouponsApi,
  createCouponApi,
  updateCouponApi,
  deleteCouponApi
} from "../../api/couponApi";
import { useShop } from "../../context/ShopContext";

export default function AdminCoupons() {
  const { showToast } = useShop();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit Modal state
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderAmount: "500",
    maxDiscountAmount: "100",
    expiryPreset: "48h", // 24h, 48h, 7d, custom
    customExpiresAt: "",
    usageLimit: "200"
  });

  const [editForm, setEditForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    expiresAt: "",
    usageLimit: "",
    isActive: true
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await getAllCouponsApi();
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();

    let expiresAtDate = new Date();
    if (form.expiryPreset === "24h") {
      expiresAtDate.setHours(expiresAtDate.getHours() + 24);
    } else if (form.expiryPreset === "48h") {
      expiresAtDate.setHours(expiresAtDate.getHours() + 48);
    } else if (form.expiryPreset === "7d") {
      expiresAtDate.setDate(expiresAtDate.getDate() + 7);
    } else if (form.customExpiresAt) {
      expiresAtDate = new Date(form.customExpiresAt);
    }

    try {
      const payload = {
        code: form.code,
        description: form.description,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount || 0),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        expiresAt: expiresAtDate,
        usageLimit: Number(form.usageLimit || 100),
        isActive: true
      };

      const res = await createCouponApi(payload);
      if (res.data?.success) {
        showToast(res.data.message || "✓ Flash coupon created!", "success");
        setShowAddModal(false);
        setForm({
          code: "",
          description: "",
          discountType: "PERCENTAGE",
          discountValue: "",
          minOrderAmount: "500",
          maxDiscountAmount: "100",
          expiryPreset: "48h",
          customExpiresAt: "",
          usageLimit: "200"
        });
        fetchCoupons();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create coupon", "error");
    }
  };

  // Open Edit Modal with Pre-filled Coupon Data
  const handleOpenEdit = (c) => {
    setEditingCoupon(c);

    // Format ISO date string for datetime-local input
    let formattedDate = "";
    if (c.expiresAt) {
      const d = new Date(c.expiresAt);
      formattedDate = d.toISOString().slice(0, 16);
    }

    setEditForm({
      code: c.code || "",
      description: c.description || "",
      discountType: c.discountType || "PERCENTAGE",
      discountValue: c.discountValue || "",
      minOrderAmount: c.minOrderAmount || 0,
      maxDiscountAmount: c.maxDiscountAmount || "",
      expiresAt: formattedDate,
      usageLimit: c.usageLimit || 100,
      isActive: c.isActive !== undefined ? c.isActive : true
    });
  };

  // Submit Edit Coupon Form
  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    if (!editingCoupon) return;

    try {
      const payload = {
        code: editForm.code,
        description: editForm.description,
        discountType: editForm.discountType,
        discountValue: Number(editForm.discountValue),
        minOrderAmount: Number(editForm.minOrderAmount || 0),
        maxDiscountAmount: editForm.maxDiscountAmount ? Number(editForm.maxDiscountAmount) : null,
        expiresAt: editForm.expiresAt ? new Date(editForm.expiresAt) : editingCoupon.expiresAt,
        usageLimit: Number(editForm.usageLimit || 100),
        isActive: editForm.isActive
      };

      const res = await updateCouponApi(editingCoupon._id, payload);
      if (res.data?.success) {
        showToast("✓ Coupon updated successfully!", "success");
        setEditingCoupon(null);
        fetchCoupons();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update coupon", "error");
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await updateCouponApi(coupon._id, { isActive: !coupon.isActive });
      showToast(`Coupon ${coupon.code} ${!coupon.isActive ? "activated" : "deactivated"}`, "info");
      fetchCoupons();
    } catch (err) {
      showToast("Failed to update coupon status", "error");
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await deleteCouponApi(id);
        showToast("Coupon deleted", "info");
        fetchCoupons();
      } catch (err) {
        showToast("Failed to delete coupon", "error");
      }
    }
  };

  return (
    <div className="space-y-8 pb-16 text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-green-600" />
            <span>FarmFresh Coupons & Flash Sales</span>
          </h1>
          <p className="text-slate-500 mt-0.5">
            Create & edit produce promotions, 24h flash clearance sales & minimum order thresholds.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Flash Coupon</span>
        </button>
      </div>

      {/* Coupons List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <h2 className="font-black text-slate-900 text-base">Active Store Promotions ({coupons.length})</h2>

        {loading ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
            <span>Loading coupons...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No active coupons found. Click "Create Flash Coupon" to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((c) => {
              const isExpired = new Date() > new Date(c.expiresAt);

              return (
                <div
                  key={c._id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 relative ${
                    isExpired
                      ? "bg-slate-50 border-slate-200 opacity-60"
                      : c.isActive
                      ? "bg-white border-green-200 shadow-xs"
                      : "bg-amber-50/50 border-amber-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-base text-slate-900 tracking-wider">
                      {c.code}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit Coupon"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Toggle Active Button */}
                      <button
                        onClick={() => handleToggleActive(c)}
                        title={c.isActive ? "Deactivate" : "Activate"}
                        className="text-slate-500 hover:text-green-600"
                      >
                        {c.isActive ? (
                          <ToggleRight className="w-6 h-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-slate-400" />
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteCoupon(c._id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                    {c.discountType === "PERCENTAGE" ? (
                      <span>{c.discountValue}% OFF {c.maxDiscountAmount ? `(Max ₹${c.maxDiscountAmount})` : ""}</span>
                    ) : (
                      <span>Flat ₹{c.discountValue} OFF</span>
                    )}
                  </div>

                  <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
                    {c.description || "Fresh produce promotion coupon"}
                  </p>

                  <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span>Minimum Spend:</span>
                      <strong className="text-slate-900">₹{c.minOrderAmount}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span>Redemptions:</span>
                      <strong className="text-slate-900">{c.usedCount} / {c.usageLimit}</strong>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Expires:</span>
                      </span>
                      <span className={`font-bold ${isExpired ? "text-red-600" : "text-slate-800"}`}>
                        {isExpired ? "Expired" : new Date(c.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" />
          <form
            onSubmit={handleCreateCoupon}
            className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 z-10 border border-slate-100 text-xs"
          >
            <h3 className="font-black text-slate-900 text-base">Create Produce Flash Coupon</h3>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Coupon Code (Uppercase) *</label>
              <input
                type="text"
                required
                placeholder="e.g. FRESH20"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono font-bold uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Description / Rules</label>
              <input
                type="text"
                placeholder="e.g. 20% OFF produce over ₹500"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Discount Type *</label>
                <select
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-semibold"
                >
                  <option value="PERCENTAGE">Percentage (% OFF)</option>
                  <option value="FIXED">Fixed Amount (Flat ₹ OFF)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Discount Value *</label>
                <input
                  type="number"
                  required
                  placeholder={form.discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 50"}
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Min Spend Threshold (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={form.minOrderAmount}
                  onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Max Discount Cap (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={form.maxDiscountAmount}
                  onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Flash Expiry Time</label>
                <select
                  value={form.expiryPreset}
                  onChange={(e) => setForm({ ...form, expiryPreset: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-semibold"
                >
                  <option value="24h">24 Hours (Flash Clearance)</option>
                  <option value="48h">48 Hours (Standard)</option>
                  <option value="7d">7 Days</option>
                  <option value="custom">Custom Date</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Usage Limit</label>
                <input
                  type="number"
                  placeholder="e.g. 200"
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>
            </div>

            {form.expiryPreset === "custom" && (
              <div>
                <label className="block text-slate-700 font-bold mb-1">Custom Expiration Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={form.customExpiresAt}
                  onChange={(e) => setForm({ ...form, customExpiresAt: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md"
              >
                Create Coupon
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Coupon Modal */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setEditingCoupon(null)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" />
          <form
            onSubmit={handleUpdateCoupon}
            className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 z-10 border border-slate-100 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base">Edit Produce Coupon</h3>
              <span className="font-mono font-bold text-green-600 text-xs">{editingCoupon.code}</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Coupon Code (Uppercase) *</label>
              <input
                type="text"
                required
                value={editForm.code}
                onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono font-bold uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Description / Rules</label>
              <input
                type="text"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Discount Type *</label>
                <select
                  value={editForm.discountType}
                  onChange={(e) => setEditForm({ ...editForm, discountType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-semibold"
                >
                  <option value="PERCENTAGE">Percentage (% OFF)</option>
                  <option value="FIXED">Fixed Amount (Flat ₹ OFF)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Discount Value *</label>
                <input
                  type="number"
                  required
                  value={editForm.discountValue}
                  onChange={(e) => setEditForm({ ...editForm, discountValue: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Min Spend Threshold (₹)</label>
                <input
                  type="number"
                  value={editForm.minOrderAmount}
                  onChange={(e) => setEditForm({ ...editForm, minOrderAmount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Max Discount Cap (₹)</label>
                <input
                  type="number"
                  value={editForm.maxDiscountAmount}
                  onChange={(e) => setEditForm({ ...editForm, maxDiscountAmount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Expiration Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={editForm.expiresAt}
                  onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Usage Limit</label>
                <input
                  type="number"
                  value={editForm.usageLimit}
                  onChange={(e) => setEditForm({ ...editForm, usageLimit: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="editIsActive"
                checked={editForm.isActive}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                className="w-4 h-4 accent-green-600 rounded cursor-pointer"
              />
              <label htmlFor="editIsActive" className="font-bold text-slate-800 cursor-pointer">
                Coupon Active & Usable
              </label>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setEditingCoupon(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
