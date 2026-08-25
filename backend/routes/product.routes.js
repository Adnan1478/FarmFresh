const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const { validateProductInput, validateMongoId } = require("../middlewares/validator.middleware");

router.get("/", getProducts);
router.get("/:id", validateMongoId("id"), getProductById);
router.post("/", protect, authorizeRoles("admin"), validateProductInput, createProduct);
router.put("/:id", protect, authorizeRoles("admin"), validateMongoId("id"), validateProductInput, updateProduct);
router.delete("/:id", protect, authorizeRoles("admin"), validateMongoId("id"), deleteProduct);

module.exports = router;
