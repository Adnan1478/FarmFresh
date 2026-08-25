const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
} = require("../controllers/auth.controller");
const protect = require("../middlewares/auth.middleware");
const {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
} = require("../middlewares/rateLimiter.middleware");

// Public Authentication & Recovery Routes with Rate Limiting Guards
router.post("/register", registerLimiter, registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password/:token", passwordResetLimiter, resetPassword);
router.get("/verify-email/:token", verifyEmail);

// Protected Authenticated Routes
router.get("/me", protect, getMe);
router.post("/resend-verification", protect, resendVerificationEmail);
router.patch("/profile", protect, updateProfile);
router.patch("/change-password", protect, changePassword);

module.exports = router;
