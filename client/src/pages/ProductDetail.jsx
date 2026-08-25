import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RefreshCw,
  Check,
  Loader2,
  Trash2,
  Send,
  User,
  MessageSquare,
  Camera,
  Image as ImageIcon,
  CornerDownRight,
  X
} from "lucide-react";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import {
  getProductReviewsApi,
  createReviewApi,
  deleteReviewApi
} from "../api/reviewApi";
import { uploadImageApi } from "../api/uploadApi";
import PriceDisplay from "../components/PriceDisplay";
import QuantitySelector from "../components/QuantitySelector";
import ProductCard from "../components/ProductCard";
import ErrorState from "../components/ErrorState";

export default function ProductDetail() {
  const { id } = useParams();
  const { products, addToCart, wishlist, toggleWishlist, showToast, refreshProducts } = useShop();
  const { user, isAuthenticated } = useAuth();

  const product = products.find((p) => p._id === id || p.slug === id) || products[0];

  const [quantity, setQuantity] = useState(1);
  const [btnState, setBtnState] = useState("IDLE"); // 'IDLE' | 'ADDING' | 'SUCCESS'
  const [activeTab, setActiveTab] = useState("description");

  // Live Product Reviews State from MongoDB
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [proofImages, setProofImages] = useState([]);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const proofFileInputRef = useRef(null);

  // Fetch reviews for current product
  const fetchReviews = async () => {
    if (!product?._id) return;
    try {
      setLoadingReviews(true);
      const res = await getProductReviewsApi(product._id);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [product?._id]);

  if (!product) {
    return <ErrorState title="Product Not Found" message="The requested vegetable or fruit could not be found." />;
  }

  const isWishlisted = wishlist.includes(product._id);
  const relatedProducts = products.filter(
    (p) => p.category?.slug === product.category?.slug && p._id !== product._id
  );

  const handleAddToCart = async () => {
    if (btnState === "ADDING") return;
    setBtnState("ADDING");
    await addToCart(product, quantity);
    setBtnState("SUCCESS");
    setTimeout(() => setBtnState("IDLE"), 1500);
  };

  // Proof Image File Selection & Upload
  const handleProofImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingProof(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);

        const res = await uploadImageApi(formData);
        if (res.data?.url) {
          setProofImages((prev) => [...prev, res.data.url]);
        }
      }
      showToast("✓ Proof photo uploaded!", "success");
    } catch (err) {
      showToast("Failed to upload proof photo", "error");
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleRemoveProofImage = (index) => {
    setProofImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Review to MongoDB
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast("Please log in to submit a product review", "error");
      return;
    }

    if (!commentInput.trim()) {
      showToast("Please write a short review comment", "error");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await createReviewApi({
        productId: product._id,
        rating: ratingInput,
        comment: commentInput,
        images: proofImages
      });

      if (res.data?.success) {
        showToast("✓ Review submitted successfully!", "success");
        setCommentInput("");
        setProofImages([]);
        fetchReviews();
        refreshProducts(); // Sync updated product average rating
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to submit review", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Delete Review
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete your review?")) {
      try {
        const res = await deleteReviewApi(reviewId);
        if (res.data?.success) {
          showToast("✓ Review deleted", "info");
          fetchReviews();
          refreshProducts();
        }
      } catch (err) {
        showToast("Failed to delete review", "error");
      }
    }
  };

  // Compute live average rating & breakdown
  const totalReviewCount = reviews.length;
  const avgRating = totalReviewCount > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewCount).toFixed(1)
    : Number(product.averageRating || 0).toFixed(1);

  return (
    <div className="space-y-12 pb-16 text-xs">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-green-600">Home</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category?.slug || "all"}`} className="hover:text-green-600 capitalize">
          {product.category?.name || "Grocery"}
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Product Image Gallery */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.isOrganic && (
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                  🌱 100% Organic
                </span>
              )}
              {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                  Only {product.stockQuantity} left!
                </span>
              )}
            </div>

            {/* Wishlist Floating Button */}
            <button
              onClick={() => toggleWishlist(product._id)}
              className={`absolute top-3 right-3 p-2.5 rounded-full shadow-md transition-all ${
                isWishlisted
                  ? "bg-red-500 text-white"
                  : "bg-white/90 text-slate-400 hover:text-red-500"
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-white" : ""}`} />
            </button>
          </div>
        </div>

        {/* Product Info Column */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {product.category?.name || "Organic"}
              </span>
              <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{avgRating}</span>
                <span className="text-slate-400 font-normal">({totalReviewCount} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>
            <p className="text-slate-500 text-xs mt-1">{product.unit || "per kg"}</p>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <PriceDisplay
              price={product.price}
              discountPrice={product.discountPrice}
              size="lg"
            />
            {product.discountPrice && (
              <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-xl">
                SAVE ₹{product.price - product.discountPrice}
              </span>
            )}
          </div>

          <p className="text-slate-600 text-xs leading-relaxed">{product.description}</p>

          {/* Quantity Selector & Add to Cart */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-700">Quantity:</span>
              <QuantitySelector
                quantity={quantity}
                onIncrement={() => setQuantity((q) => Math.min(product.stockQuantity || 20, q + 1))}
                onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
                max={product.stockQuantity || 20}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAddToCart}
                disabled={btnState === "ADDING" || product.stockQuantity === 0}
                className={`flex-1 font-bold py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all text-xs active:scale-98 ${
                  btnState === "SUCCESS"
                    ? "bg-emerald-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {btnState === "ADDING" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding to Cart...</span>
                  </>
                ) : btnState === "SUCCESS" ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Shopping Cart (₹{(product.discountPrice || product.price) * quantity})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-[11px] text-slate-600 font-semibold">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-green-600 shrink-0" />
              <span>2-Hour Express Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
              <span>100% Organic Quality</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description / Nutrition / Reviews */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <div className="flex border-b border-slate-100 gap-8 text-sm font-bold">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "description"
                ? "border-green-600 text-green-600"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            Product Description
          </button>
          <button
            onClick={() => setActiveTab("nutrition")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "nutrition"
                ? "border-green-600 text-green-600"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            Nutrition & Storage
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "reviews"
                ? "border-green-600 text-green-600"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Customer Reviews ({totalReviewCount})</span>
          </button>
        </div>

        {activeTab === "description" && (
          <div className="text-xs text-slate-600 leading-relaxed space-y-2">
            <p>{product.description}</p>
            <p>
              Our fresh produce is harvested early in the morning by hand to preserve natural nutrients, crunch, and aroma. Carefully packed in eco-friendly protective bags.
            </p>
          </div>
        )}

        {activeTab === "nutrition" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-slate-400 block mb-1">Calories</span>
              <span className="font-bold text-slate-800 text-sm">18 kcal / 100g</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-slate-400 block mb-1">Vitamin C</span>
              <span className="font-bold text-slate-800 text-sm">28% DV</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-slate-400 block mb-1">Dietary Fiber</span>
              <span className="font-bold text-slate-800 text-sm">1.2 g</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-slate-400 block mb-1">Storage</span>
              <span className="font-bold text-slate-800 text-sm">Store at 4°C - 8°C</span>
            </div>
          </div>
        )}

        {/* Tab 3: Customer Ratings & Reviews */}
        {activeTab === "reviews" && (
          <div className="space-y-8">
            {/* Rating Summary Card */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <div className="text-3xl font-black text-slate-900">{avgRating} / 5.0</div>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 my-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(avgRating) ? "fill-amber-400" : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-slate-500">Based on {totalReviewCount} customer ratings</div>
              </div>

              {/* Submit Review Button CTA */}
              {isAuthenticated ? (
                <div className="text-right">
                  <p className="text-slate-600 text-xs font-semibold mb-1">Have you bought this item?</p>
                  <a
                    href="#write-review-form"
                    className="inline-flex items-center gap-1.5 bg-green-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-green-700 transition-colors shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Write a Review & Add Photos</span>
                  </a>
                </div>
              ) : (
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                  <p className="text-slate-600 text-xs mb-1">Log in to post your review</p>
                  <Link to="/login" className="text-green-600 font-bold hover:underline">
                    Sign In to Review →
                  </Link>
                </div>
              )}
            </div>

            {/* Write a Review Interactive Form (with Photo Upload) */}
            {isAuthenticated && (
              <form
                id="write-review-form"
                onSubmit={handleReviewSubmit}
                className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 space-y-4"
              >
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Write Buyer Feedback & Attach Photos</span>
                </h4>

                {/* Star Rating Interactive Selector */}
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold text-xs">Select Rating *</label>
                  <div className="flex items-center gap-1 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= (hoverRating || ratingInput)
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-bold text-amber-700 text-xs">
                      {ratingInput} of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold text-xs">Your Product Opinion *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tell other shoppers what you liked or disliked about this fresh produce..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-green-600 text-slate-900 font-medium text-xs"
                  />
                </div>

                {/* Proof Photos Uploader */}
                <div className="space-y-2">
                  <label className="block text-slate-700 font-bold text-xs flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Attach Proof Photos (Optional)</span>
                  </label>

                  <div className="flex flex-wrap items-center gap-2">
                    {proofImages.map((url, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-emerald-200 group">
                        <img src={url} alt="Proof Thumbnail" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveProofImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => proofFileInputRef.current?.click()}
                      disabled={isUploadingProof}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-700 flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-colors"
                    >
                      {isUploadingProof ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Camera className="w-4 h-4 text-emerald-600" />
                          <span>Add Photo</span>
                        </>
                      )}
                    </button>

                    <input
                      type="file"
                      ref={proofFileInputRef}
                      onChange={handleProofImageUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview || !commentInput.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-xs transition-colors"
                >
                  {isSubmittingReview ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Review...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Review</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* List of Verified Customer Reviews */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Customer Opinions & Proof Photos</h4>

              {loadingReviews ? (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                  <span>Loading reviews from database...</span>
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-slate-50 p-8 text-center rounded-2xl border border-slate-100 text-slate-500">
                  No customer reviews yet for this product. Be the first to post your feedback!
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => {
                    const isAuthor = user && r.user && r.user._id === user._id;
                    const isAdmin = user && user.role === "admin";

                    return (
                      <div
                        key={r._id}
                        className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-100 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-green-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                              {r.user?.avatar ? (
                                <img src={r.user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span>{r.user?.name?.[0]?.toUpperCase() || "U"}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{r.user?.name || "Verified Buyer"}</div>
                              <div className="text-[10px] text-slate-400">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Stars */}
                            <div className="flex text-amber-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= r.rating ? "fill-amber-400" : "text-slate-300"
                                  }`}
                                />
                              ))}
                            </div>

                            {/* Delete Review Button */}
                            {(isAuthor || isAdmin) && (
                              <button
                                onClick={() => handleDeleteReview(r._id)}
                                className="p-1 text-slate-400 hover:text-red-600 transition-colors ml-2"
                                title="Delete review"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Review Comment Text */}
                        <p className="text-slate-800 leading-relaxed font-medium text-xs">
                          {r.comment}
                        </p>

                        {/* Buyer Proof Photos */}
                        {r.images && r.images.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <ImageIcon className="w-3 h-3 text-emerald-600" />
                              <span>Buyer Proof Photos</span>
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto py-1">
                              {r.images.map((imgUrl, imgIdx) => (
                                <a
                                  key={imgIdx}
                                  href={imgUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white hover:opacity-90 transition-opacity shrink-0"
                                >
                                  <img src={imgUrl} alt="Buyer Proof" className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Official Store Admin Reply */}
                        {r.adminReply && (
                          <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100 space-y-1 text-emerald-950 mt-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                              <span className="flex items-center gap-1.5">
                                <CornerDownRight className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Official Store Owner Response</span>
                              </span>
                              <span className="text-[10px] text-emerald-600 font-normal">
                                {r.adminRepliedAt ? new Date(r.adminRepliedAt).toLocaleDateString() : ""}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed font-medium pl-4 border-l-2 border-emerald-500">
                              {r.adminReply}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900">You Might Also Like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
