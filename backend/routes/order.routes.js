const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAssignedDeliveryOrders,
  assignDeliveryBoy,
  updateDeliveryStatus,
} = require("../controllers/order.controller");
const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/delivery/assigned", protect, authorizeRoles("deliveryboy", "admin"), getAssignedDeliveryOrders);
router.get("/", protect, authorizeRoles("admin", "customer", "deliveryboy"), getAllOrders);
router.get("/:id", protect, getOrderById);
router.patch("/:id/assign-delivery", protect, authorizeRoles("admin"), assignDeliveryBoy);
router.patch("/:id/delivery-status", protect, authorizeRoles("deliveryboy", "admin"), updateDeliveryStatus);
router.patch("/:id/status", protect, authorizeRoles("admin", "customer"), updateOrderStatus);
router.patch("/:id/cancel", protect, cancelOrder);

module.exports = router;
