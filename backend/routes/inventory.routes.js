const express = require("express");
const router = express.Router();
const {
  getInventorySummary,
  getLowStockAlerts,
  getExpiringBatches,
  getStockMovements,
} = require("../controllers/inventory.controller");
const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.get("/summary", protect, authorizeRoles("admin"), getInventorySummary);
router.get("/low-stock", protect, authorizeRoles("admin"), getLowStockAlerts);
router.get("/expiring-batches", protect, authorizeRoles("admin"), getExpiringBatches);
router.get("/movements", protect, authorizeRoles("admin"), getStockMovements);

module.exports = router;
