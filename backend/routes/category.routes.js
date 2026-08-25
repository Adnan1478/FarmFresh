const express = require("express");
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/category.controller");
const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", protect, authorizeRoles("admin", "customer"), createCategory);
router.put("/:id", protect, authorizeRoles("admin", "customer"), updateCategory);
router.delete("/:id", protect, authorizeRoles("admin", "customer"), deleteCategory);

module.exports = router;
