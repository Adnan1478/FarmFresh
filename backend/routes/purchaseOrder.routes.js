const express = require("express");
const router = express.Router();
const {
  createPurchaseOrder,
  getAllPurchaseOrders,
  receivePurchaseOrder,
} = require("../controllers/purchaseOrder.controller");
const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.post("/", protect, authorizeRoles("admin"), createPurchaseOrder);
router.get("/", protect, authorizeRoles("admin"), getAllPurchaseOrders);
router.patch("/:id/receive", protect, authorizeRoles("admin"), receivePurchaseOrder);

module.exports = router;
