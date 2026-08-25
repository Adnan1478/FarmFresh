const mongoose = require("mongoose");
const Review = require("../models/review.model");
const Product = require("../models/product.model");

// Helper to recalculate average rating and total reviews for a product
const updateProductRatingStats = async (productId) => {
  const reviews = await Review.find({ product: productId, status: "approved" });
  const totalReviews = reviews.length;
  let averageRating = 0;

  if (totalReviews > 0) {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    averageRating = Number((sum / totalReviews).toFixed(1));
  }

  await Product.findByIdAndUpdate(productId, {
    averageRating,
    totalReviews,
  });
};

// @desc    Create or update review for a product (Buyer)
// @route   POST /api/reviews
// @access  Private (Buyer)
exports.createOrUpdateReview = async (req, res) => {
  try {
    const { productId, rating, comment, images } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Product ID, rating (1-5), and review comment are required",
      });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5",
      });
    }

    // Lookup product
    const isObjectId = mongoose.Types.ObjectId.isValid(productId);
    let product = null;

    if (isObjectId) {
      product = await Product.findById(productId);
    } else {
      product = await Product.findOne({ $or: [{ slug: productId }, { name: productId }] });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const proofImages = Array.isArray(images) ? images : [];

    // Check if user already reviewed this product
    let review = await Review.findOne({ user: req.user.id, product: product._id });

    if (review) {
      // Update existing review
      review.rating = numericRating;
      review.comment = comment.trim();
      if (proofImages.length > 0) {
        review.images = proofImages;
      }
      review.status = "approved"; // Keep approved or send for re-approval
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        user: req.user.id,
        product: product._id,
        rating: numericRating,
        comment: comment.trim(),
        images: proofImages,
        status: "approved",
      });
    }

    // Recalculate product rating stats in MongoDB
    await updateProductRatingStats(product._id);

    const populated = await Review.findById(review._id)
      .populate("user", "name avatar role")
      .populate("product", "name images");

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      data: populated,
    });
  } catch (error) {
    console.error("Create Review Error:", error);
    return res.status(500).json({ success: false, message: "Error submitting review" });
  }
};

// @desc    Get approved reviews for a product (Public Shoppers)
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const isObjectId = mongoose.Types.ObjectId.isValid(productId);
    let targetProductId = productId;

    if (!isObjectId) {
      const product = await Product.findOne({ $or: [{ slug: productId }, { name: productId }] });
      if (product) {
        targetProductId = product._id;
      }
    }

    // Fetch approved reviews for public shoppers
    const reviews = await Review.find({ product: targetProductId, status: "approved" })
      .populate("user", "name avatar role")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Get Product Reviews Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching product reviews" });
  }
};

// @desc    Get all reviews for Admin Panel (Moderation Dashboard)
// @route   GET /api/reviews/admin
// @access  Private (Admin)
exports.getAllReviewsAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    const reviews = await Review.find(query)
      .populate("user", "name email avatar")
      .populate("product", "name images price category")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Get Admin Reviews Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching admin reviews" });
  }
};

// @desc    Approve or Reject a review (Admin)
// @route   PATCH /api/reviews/:id/status
// @access  Private (Admin)
exports.updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "approved", "rejected"];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: pending, approved, rejected",
      });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    review.status = status;
    await review.save();

    // Recalculate product rating stats
    await updateProductRatingStats(review.product);

    return res.json({
      success: true,
      message: `Review status updated to ${status.toUpperCase()}`,
      data: review,
    });
  } catch (error) {
    console.error("Update Review Status Error:", error);
    return res.status(500).json({ success: false, message: "Error updating review status" });
  }
};

// @desc    Official Admin Store Reply to customer review
// @route   PATCH /api/reviews/:id/reply
// @access  Private (Admin)
exports.replyToReview = async (req, res) => {
  try {
    const { adminReply } = req.body;

    if (!adminReply || !adminReply.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply text cannot be empty",
      });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    review.adminReply = adminReply.trim();
    review.adminRepliedAt = new Date();
    await review.save();

    const populated = await Review.findById(review._id)
      .populate("user", "name avatar email")
      .populate("product", "name images");

    return res.json({
      success: true,
      message: "Official store reply published successfully!",
      data: populated,
    });
  } catch (error) {
    console.error("Reply to Review Error:", error);
    return res.status(500).json({ success: false, message: "Error adding store reply" });
  }
};

// @desc    Delete review (Author or Admin)
// @route   DELETE /api/reviews/:id
// @access  Private (Author or Admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Authorization check
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this review",
      });
    }

    const productId = review.product;
    await review.deleteOne();

    // Recalculate product rating stats
    await updateProductRatingStats(productId);

    return res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete Review Error:", error);
    return res.status(500).json({ success: false, message: "Error deleting review" });
  }
};
