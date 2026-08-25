import React, { useState, useEffect } from "react";
import {
  Star,
  MessageSquare,
  CheckCircle,
  XCircle,
  Trash2,
  Send,
  Search,
  Filter,
  Loader2,
  Image as ImageIcon,
  ShieldCheck,
  User,
  Package,
  CornerDownRight
} from "lucide-react";
import {
  getAllReviewsAdminApi,
  updateReviewStatusApi,
  replyToReviewApi,
  deleteReviewApi
} from "../../api/reviewApi";
import { useShop } from "../../context/ShopContext";

export default function AdminReviews() {
  const { showToast } = useShop();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Selected Review for Reply Modal
  const [replyingReview, setReplyingReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchAdminReviews = async () => {
    try {
      setLoading(true);
      const res = await getAllReviewsAdminApi({ status: statusFilter });
      if (res.data?.success && Array.isArray(res.data.data)) {
        let list = res.data.data;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          list = list.filter(
            (r) =>
              (r.product?.name && r.product.name.toLowerCase().includes(q)) ||
              (r.user?.name && r.user.name.toLowerCase().includes(q)) ||
              (r.comment && r.comment.toLowerCase().includes(q))
          );
        }
        setMessagesOrReviews(list);
      }
    } catch (err) {
      showToast("Error loading customer reviews from database", "error");
    } finally {
      setLoading(false);
    }
  };

  const setMessagesOrReviews = (list) => {
    setReviews(list);
  };

  useEffect(() => {
    fetchAdminReviews();
  }, [statusFilter]);

  // Update Review Status (Approve / Reject) in MongoDB
  const handleUpdateStatus = async (reviewId, newStatus) => {
    setUpdatingId(reviewId);
    try {
      const res = await updateReviewStatusApi(reviewId, newStatus);
      if (res.data?.success) {
        showToast(`✓ Review status updated to ${newStatus.toUpperCase()}`, "success");
        fetchAdminReviews();
      }
    } catch (err) {
      showToast("Failed to update review status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Official Store Reply Submission
  const handleSendStoreReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyingReview) return;

    setIsSubmittingReply(true);
    try {
      const res = await replyToReviewApi(replyingReview._id, replyText);
      if (res.data?.success) {
        showToast("✓ Official store response published to product page!", "success");
        setReplyingReview(null);
        setReplyText("");
        fetchAdminReviews();
      }
    } catch (err) {
      showToast("Failed to publish store reply", "error");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Delete Review from MongoDB
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this customer review?")) {
      setUpdatingId(reviewId);
      try {
        const res = await deleteReviewApi(reviewId);
        if (res.data?.success) {
          showToast("✓ Review deleted from database", "info");
          fetchAdminReviews();
        }
      } catch (err) {
        showToast("Failed to delete review", "error");
      } finally {
        setUpdatingId(null);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">✓ Approved (Live)</span>;
      case "pending":
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">⏳ Pending Moderation</span>;
      case "rejected":
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">✕ Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12 text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span>Product Reviews Moderation & Reply Panel</span>
          </h1>
          <p className="text-slate-500 mt-1">
            Check buyer feedback, inspect proof photos, approve/reject posts, and publish official store replies.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl font-bold text-slate-700">
          Total Reviews: <span className="text-green-600 font-black text-sm">{reviews.length}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto font-bold">
          {["all", "approved", "pending", "rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl capitalize transition-all ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search product, buyer, comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchAdminReviews()}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 outline-none focus:border-green-600 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Main Reviews Moderation List */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 gap-3">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <p className="text-slate-500 font-semibold">Loading product reviews from database...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
          <Star className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Product Reviews Found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            No customer reviews match your selected status filter or search query.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4 transition-all hover:border-slate-200"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                {/* Product & Buyer Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={r.product?.images?.[0] || ""}
                    alt={r.product?.name || "Product"}
                    className="w-12 h-12 object-cover rounded-xl bg-slate-50 border border-slate-100 shrink-0"
                  />
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">{r.product?.name || "Product"}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-700">Buyer: {r.user?.name || "Customer"}</span>
                      <span>•</span>
                      <span>{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Rating & Status Badge */}
                <div className="flex items-center gap-3">
                  <div className="flex text-amber-400 font-bold">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= r.rating ? "fill-amber-400" : "text-slate-200"
                        }`}
                      />
                    ))}
                    <span className="ml-1.5 text-slate-800 text-xs">{r.rating}/5</span>
                  </div>

                  <div>{getStatusBadge(r.status)}</div>
                </div>
              </div>

              {/* Review Comment Text */}
              <div className="text-slate-800 text-xs leading-relaxed font-medium bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                "{r.comment}"
              </div>

              {/* Buyer Proof Photos Gallery */}
              {r.images && r.images.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Buyer Proof Photos ({r.images.length})</span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {r.images.map((imgUrl, imgIdx) => (
                      <a
                        key={imgIdx}
                        href={imgUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 hover:opacity-90 transition-opacity shrink-0"
                      >
                        <img src={imgUrl} alt="Buyer Proof" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Store Admin Reply Box (If Replied) */}
              {r.adminReply && (
                <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100 space-y-1 text-emerald-950">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Official Store Response</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-normal">
                      {r.adminRepliedAt ? new Date(r.adminRepliedAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed font-medium pl-4 border-l-2 border-emerald-400">
                    {r.adminReply}
                  </p>
                </div>
              )}

              {/* Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {/* Approve Button */}
                  {r.status !== "approved" && (
                    <button
                      onClick={() => handleUpdateStatus(r._id, "approved")}
                      disabled={updatingId === r._id}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve Review</span>
                    </button>
                  )}

                  {/* Reject Button */}
                  {r.status !== "rejected" && (
                    <button
                      onClick={() => handleUpdateStatus(r._id, "rejected")}
                      disabled={updatingId === r._id}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>Reject & Hide</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Store Reply Button */}
                  <button
                    onClick={() => {
                      setReplyingReview(r);
                      setReplyText(r.adminReply || "");
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <CornerDownRight className="w-3.5 h-3.5 text-green-400" />
                    <span>{r.adminReply ? "Edit Store Reply" : "Reply to Buyer"}</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteReview(r._id)}
                    disabled={updatingId === r._id}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official Admin Store Reply Modal */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setReplyingReview(null)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" />

          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 z-10 border border-slate-100 animate-slideUp text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Official Store Reply</span>
                <h3 className="font-black text-slate-900 text-base mt-0.5">
                  Reply to {replyingReview.user?.name || "Buyer"}
                </h3>
              </div>
              <div className="text-amber-500 font-bold flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{replyingReview.rating}/5</span>
              </div>
            </div>

            {/* Buyer Comment Snapshot */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-slate-700 italic">
              "{replyingReview.comment}"
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendStoreReply} className="space-y-3">
              <label className="font-bold text-slate-800 block">
                Type Store Response (Will be displayed publicly on product page):
              </label>
              <textarea
                required
                rows={4}
                placeholder="e.g. Thank you for your feedback! We take product quality seriously..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-green-600 font-medium text-slate-900"
              />

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReply || !replyText.trim()}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  {isSubmittingReply ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish Official Reply</span>
                    </>
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
