const express = require("express");
const router = express.Router();
const {
  validateCoupon,
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/coupon.controller");
const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const { validateCouponInput, validateMongoId } = require("../middlewares/validator.middleware");

// Customer public route to validate coupon
router.post("/validate", validateCoupon);

// Admin routes
router.post("/", protect, authorizeRoles("admin"), validateCouponInput, createCoupon);
router.get("/", protect, authorizeRoles("admin"), getAllCoupons);
router.put("/:id", protect, authorizeRoles("admin"), validateMongoId("id"), updateCoupon);
router.delete("/:id", protect, authorizeRoles("admin"), validateMongoId("id"), deleteCoupon);

module.exports = router;
