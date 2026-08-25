const express = require("express");
const router = express.Router();
const {
  createSupplier,
  getAllSuppliers,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplier.controller");
const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.post("/", protect, authorizeRoles("admin"), createSupplier);
router.get("/", protect, authorizeRoles("admin"), getAllSuppliers);
router.put("/:id", protect, authorizeRoles("admin"), updateSupplier);
router.delete("/:id", protect, authorizeRoles("admin"), deleteSupplier);

module.exports = router;
