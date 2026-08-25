const express = require("express");
const router = express.Router();
const {
  createOrUpdateReview,
  getProductReviews,
  getAllReviewsAdmin,
  updateReviewStatus,
  replyToReview,
  deleteReview,
} = require("../controllers/review.controller");
const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const { validateReviewInput, validateMongoId } = require("../middlewares/validator.middleware");

// Public route to fetch approved reviews for a product
router.get("/product/:productId", validateMongoId("productId"), getProductReviews);

// Protected route for buyer review submission
router.post("/", protect, validateReviewInput, createOrUpdateReview);

// Admin-only management and moderation routes
router.get("/admin", protect, authorizeRoles("admin"), getAllReviewsAdmin);
router.patch("/:id/status", protect, authorizeRoles("admin"), validateMongoId("id"), updateReviewStatus);
router.patch("/:id/reply", protect, authorizeRoles("admin"), validateMongoId("id"), replyToReview);
router.delete("/:id", protect, validateMongoId("id"), deleteReview);

module.exports = router;
