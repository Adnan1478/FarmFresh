const express = require("express");
const router = express.Router();
const {
  getVendorDashboard,
  submitHarvestBatch,
  getVendorSupplies,
  updateSupplyStatus,
} = require("../controllers/vendor.controller");
const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.get("/dashboard", protect, authorizeRoles("vendor", "admin"), getVendorDashboard);
router.post("/supplies", protect, authorizeRoles("vendor", "admin"), submitHarvestBatch);
router.get("/supplies", protect, authorizeRoles("vendor", "admin"), getVendorSupplies);
router.patch("/supplies/:id/status", protect, authorizeRoles("admin"), updateSupplyStatus);

module.exports = router;
