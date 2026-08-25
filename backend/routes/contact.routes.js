const express = require("express");
const router = express.Router();
const {
  createContactMessage,
  getAllContactMessages,
  updateContactStatus,
  deleteContactMessage,
} = require("../controllers/contact.controller");
const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const { validateContactInput, validateMongoId } = require("../middlewares/validator.middleware");

// Public route to send contact message
router.post("/", validateContactInput, createContactMessage);

// Admin-only management routes
router.get("/", protect, authorizeRoles("admin"), getAllContactMessages);
router.patch("/:id/status", protect, authorizeRoles("admin"), validateMongoId("id"), updateContactStatus);
router.delete("/:id", protect, authorizeRoles("admin"), validateMongoId("id"), deleteContactMessage);

module.exports = router;
