import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Layers,
  AlertCircle,
  Loader2,
  Leaf,
  FolderPlus,
  RefreshCw
} from "lucide-react";
import {
  getProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  getCategoriesApi,
  createCategoryApi
} from "../../api/productApi";
import { useShop } from "../../context/ShopContext";
import ImageUploader from "../../components/ImageUploader";

export default function AdminProducts() {
  const { showToast, refreshProducts } = useShop();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    discountPrice: "",
    unit: "kg",
    stock: "10",
    isOrganic: false,
    isFeatured: false,
    image: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Inline Quick Add Category Modal State
  const [isQuickCatOpen, setIsQuickCatOpen] = useState(false);
  const [quickCatData, setQuickCatData] = useState({ name: "", description: "" });
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await getCategoriesApi();
      if (res.data?.success) {
        setCategories(res.data.data);
        return res.data.data;
      }
    } catch (err) {
      console.error("Error loading categories", err);
    }
    return [];
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([getProductsApi(), getCategoriesApi()]);

      if (prodRes.data?.success) {
        setProducts(prodRes.data.data);
      }
      if (catRes.data?.success) {
        setCategories(catRes.data.data);
      }
    } catch (err) {
      showToast("Error fetching product data from server", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = async () => {
    const latestCats = await fetchCategories();
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      category: latestCats[0]?._id || "",
      price: "",
      discountPrice: "",
      unit: "kg",
      stock: "10",
      isOrganic: false,
      isFeatured: false,
      image: ""
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (prod) => {
    const latestCats = await fetchCategories();
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      description: prod.description || "",
      category: prod.category?._id || prod.category || latestCats[0]?._id || "",
      price: prod.price || "",
      discountPrice: prod.discountPrice || "",
      unit: prod.unit || "kg",
      stock: prod.stock !== undefined ? prod.stock : 10,
      isOrganic: Boolean(prod.isOrganic),
      isFeatured: Boolean(prod.isFeatured),
      image: prod.images?.[0] || ""
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  // Quick Add Category Inline
  const handleQuickCreateCategory = async (e) => {
    e.preventDefault();
    if (!quickCatData.name.trim()) return;

    setIsCreatingCat(true);
    try {
      const res = await createCategoryApi({
        name: quickCatData.name.trim(),
        description: quickCatData.description.trim()
      });

      if (res.data?.success && res.data?.data) {
        showToast(`✓ Category "${res.data.data.name}" created!`, "success");
        const newCat = res.data.data;
        await fetchCategories();
        // Automatically select the newly created category in product form
        setFormData((prev) => ({ ...prev, category: newCat._id }));
        setIsQuickCatOpen(false);
        setQuickCatData({ name: "", description: "" });
      }
    } catch (err) {
      showToast(err.message || "Failed to create category", "error");
    } finally {
      setIsCreatingCat(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage("Product name is required");
      return;
    }
    if (!formData.category) {
      setErrorMessage("Please select a valid Category from the dropdown (or add one)");
      return;
    }
    if (!formData.price || Number(formData.price) < 0) {
      setErrorMessage("Please enter a valid price");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const payload = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
      unit: formData.unit,
      stock: Number(formData.stock),
      isOrganic: formData.isOrganic,
      isFeatured: formData.isFeatured,
      images: formData.image ? [formData.image] : []
    };

    try {
      if (editingProduct) {
        await updateProductApi(editingProduct._id, payload);
        showToast("✓ Product updated successfully!", "success");
      } else {
        await createProductApi(payload);
        showToast("✓ Product created successfully!", "success");
      }
      setIsModalOpen(false);
      fetchData();
      if (refreshProducts) refreshProducts();
    } catch (err) {
      setErrorMessage(err.message || "Failed to save product. Check required fields.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      try {
        await deleteProductApi(id);
        showToast("Product deleted successfully", "info");
        fetchData();
        if (refreshProducts) refreshProducts();
      } catch (err) {
        showToast(err.message || "Failed to delete product", "error");
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === "all" ||
      p.category?._id === selectedCategoryFilter ||
      p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-green-600" />
            <span>Product Inventory Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Add categories first, then select them when creating or updating products.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/categories"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-4 h-4 text-green-600" />
            <span>Manage Categories ({categories.length})</span>
          </Link>

          <button
            onClick={handleOpenAddModal}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md text-xs flex items-center gap-2 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* No Category Warning Banner */}
      {categories.length === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>Step 1 Required:</strong> No categories found in database. Add a Category first so you can select it when adding products!
            </span>
          </div>
          <Link
            to="/admin/categories"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shrink-0 transition-colors"
          >
            + Create Category Now
          </Link>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-green-600 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
          <span className="font-bold text-slate-500 shrink-0">Filter by Category:</span>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-800 outline-none focus:border-green-600"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 gap-3">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Loading product inventory from database...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No Products Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click "+ Add Product" above to insert fresh produce under your created categories.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Product Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price / Unit</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Badges</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredProducts.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                        <img
                          src={prod.images?.[0] || "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=200&q=80"}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{prod.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">slug: {prod.slug}</div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="bg-green-100 text-green-800 font-bold px-2.5 py-1 rounded-full text-[10px]">
                        {prod.category?.name || "Uncategorized"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-900">₹{prod.price} / {prod.unit}</div>
                      {prod.discountPrice && (
                        <div className="text-[11px] text-slate-400 line-through">₹{prod.discountPrice}</div>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          prod.stock > 10
                            ? "bg-emerald-100 text-emerald-800"
                            : prod.stock > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {prod.stock > 0 ? `${prod.stock} in stock` : "Out of Stock"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {prod.isOrganic && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-200">
                            <Leaf className="w-3 h-3" /> Organic
                          </span>
                        )}
                        {prod.isFeatured && (
                          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                            ★ Featured
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-2 text-slate-600 hover:text-green-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod._id, prod.name)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" />

          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 z-10 border border-slate-100 animate-slideUp text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingProduct ? "Edit Product" : "Add Product to Inventory"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="bg-red-50 text-red-800 p-3 rounded-xl border border-red-100 flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Almonds, Spinach, Mangoes"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                />
              </div>

              {/* Category Dropdown with Quick Add Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-bold uppercase tracking-wider">
                    Assigned Category *
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={fetchCategories}
                      className="text-slate-400 hover:text-slate-600 p-1"
                      title="Refresh categories list"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsQuickCatOpen(true)}
                      className="text-green-600 font-bold text-[11px] hover:underline flex items-center gap-1"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>+ Quick Add Category</span>
                    </button>
                  </div>
                </div>

                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                >
                  <option value="">-- Select a Category --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                  Description *
                </label>
                <textarea
                  rows="2"
                  required
                  placeholder="Freshly harvested produce details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium resize-none text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="450"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="400"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                    Unit *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                  >
                    <option value="kg">kg</option>
                    <option value="gram">gram</option>
                    <option value="piece">piece</option>
                    <option value="dozen">dozen</option>
                    <option value="liter">liter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="20"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                />
              </div>

              {/* Image Picker Component */}
              <ImageUploader
                label="Product Image"
                value={formData.image}
                onChange={(imgUrl) => setFormData({ ...formData, image: imgUrl })}
              />

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isOrganic}
                    onChange={(e) => setFormData({ ...formData, isOrganic: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span>100% Organic</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span>Featured Product</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Product...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? "Update Product" : "Create Product"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Category Sub-Modal */}
      {isQuickCatOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsQuickCatOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />

          <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 z-20 border border-slate-100 animate-slideUp text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Quick Add New Category</h3>
              <button onClick={() => setIsQuickCatOpen(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleQuickCreateCategory} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dry Fruits, Nuts, Juices"
                  value={quickCatData.name}
                  onChange={(e) => setQuickCatData({ ...quickCatData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Brief description of items..."
                  value={quickCatData.description}
                  onChange={(e) => setQuickCatData({ ...quickCatData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 text-slate-900 font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCatOpen(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isCreatingCat}
                  className="flex-1 bg-green-600 text-white font-bold py-2 rounded-xl shadow-md flex items-center justify-center gap-1"
                >
                  {isCreatingCat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Save & Select</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
