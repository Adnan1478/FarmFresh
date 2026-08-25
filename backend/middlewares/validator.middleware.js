const { body, param, query, validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Helper to catch validation errors and return structured 400 Bad Request
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: formattedErrors[0]?.message || "Validation failed",
      errors: formattedErrors,
    });
  }
  next();
};

// Validate MongoDB ObjectId parameter
const validateMongoId = (paramName = "id") => [
  param(paramName)
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage(`Invalid ID format. Must be a valid 24-character hex string.`),
  handleValidationErrors,
];

// Validate Auth Registration Input
const validateAuthRegister = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("phone")
    .optional({ checkFalsy: true })
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits"),
  handleValidationErrors,
];

// Validate Auth Login Input
const validateAuthLogin = [
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// Validate Product Creation & Update
const validateProductInput = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("category")
    .notEmpty()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid category ID format"),
  body("unit")
    .optional()
    .isIn(["kg", "g", "bunch", "pack", "piece", "liter", "dz"])
    .withMessage("Invalid unit specification"),
  handleValidationErrors,
];

// Validate Category Creation & Update
const validateCategoryInput = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Category name must be between 2 and 50 characters"),
  handleValidationErrors,
];

// Validate Product Review Input
const validateReviewInput = [
  body("product")
    .notEmpty()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid product ID format"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5"),
  body("comment")
    .trim()
    .notEmpty()
    .withMessage("Review comment is required")
    .isLength({ min: 3, max: 1000 })
    .withMessage("Review comment must be between 3 and 1000 characters"),
  handleValidationErrors,
];

// Validate Contact Inquiry Input
const validateContactInput = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("Please enter a valid email address").normalizeEmail(),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message text is required")
    .isLength({ min: 5, max: 2000 })
    .withMessage("Message must be between 5 and 2000 characters"),
  handleValidationErrors,
];

// Validate Coupon Creation Input
const validateCouponInput = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Coupon code is required")
    .isAlphanumeric()
    .withMessage("Coupon code must contain only letters and numbers"),
  body("discountType")
    .isIn(["PERCENTAGE", "FIXED"])
    .withMessage("Discount type must be PERCENTAGE or FIXED"),
  body("discountValue")
    .isFloat({ min: 0 })
    .withMessage("Discount value must be a positive number"),
  body("expiresAt")
    .isISO8601()
    .withMessage("Valid expiration date is required"),
  handleValidationErrors,
];

// Validate Harvest Batch Input (Vendor)
const validateVendorHarvestInput = [
  body("produceName").trim().notEmpty().withMessage("Produce name is required"),
  body("quantityHarvested")
    .isFloat({ min: 0.1 })
    .withMessage("Harvested quantity must be greater than 0"),
  body("pricePerUnit")
    .isFloat({ min: 0 })
    .withMessage("Price per unit must be a non-negative number"),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateMongoId,
  validateAuthRegister,
  validateAuthLogin,
  validateProductInput,
  validateCategoryInput,
  validateReviewInput,
  validateContactInput,
  validateCouponInput,
  validateVendorHarvestInput,
};
