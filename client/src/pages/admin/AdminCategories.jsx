import React, { useState, useEffect } from "react";
import {
  FolderPlus,
  Edit2,
  Trash2,
  Plus,
  Loader2,
  Search,
  AlertCircle,
  Tag,
  Layers
} from "lucide-react";
import { getCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi } from "../../api/productApi";
import { useShop } from "../../context/ShopContext";
import ImageUploader from "../../components/ImageUploader";

export default function AdminCategories() {
  const { showToast, refreshCategories } = useShop();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getCategoriesApi();
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      showToast("Error loading categories from server", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", image: "" });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || "",
      image: cat.image || ""
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage("Category name is required");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (editingCategory) {
        await updateCategoryApi(editingCategory._id, formData);
        showToast("✓ Category updated successfully!", "success");
      } else {
        await createCategoryApi(formData);
        showToast("✓ Category created successfully!", "success");
      }
      setIsModalOpen(false);
      fetchCategories();
      if (refreshCategories) refreshCategories();
    } catch (err) {
      setErrorMessage(err.message || "Operation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await deleteCategoryApi(id);
        showToast("Category deleted successfully", "info");
        fetchCategories();
        if (refreshCategories) refreshCategories();
      } catch (err) {
        showToast(err.message || "Failed to delete category", "error");
      }
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-green-600" />
            <span>Category Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create store category groupings (e.g. Vegetables, Fruits, Dry Fruits, Nuts, Juices, Organic Products).
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md text-xs flex items-center gap-2 transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-green-600 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="text-xs font-bold text-slate-500">
          Total Categories: <span className="text-slate-900">{categories.length}</span>
        </div>
      </div>

      {/* Category Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 gap-3">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Loading categories from database...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <FolderPlus className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No Categories Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click "Add New Category" above to create your store categories (e.g. Vegetables, Fruits, Dry Fruits, Nuts).
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md"
          >
            + Create First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    Active
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">slug: {cat.slug}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <Tag className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{cat.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                      {cat.description || "No description provided."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                <button
                  onClick={() => handleOpenEditModal(cat)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDelete(cat._id, cat.name)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" />

          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 z-10 border border-slate-100 animate-slideUp text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingCategory ? "Edit Category" : "Add New Category"}
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
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vegetables, Dry Fruits, Nuts, Juices"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Brief overview of items under this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-green-600 font-medium resize-none text-slate-900"
                />
              </div>

              {/* Image Picker Component */}
              <ImageUploader
                label="Category Image"
                value={formData.image}
                onChange={(imgUrl) => setFormData({ ...formData, image: imgUrl })}
              />

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
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? "Update Category" : "Create Category"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
