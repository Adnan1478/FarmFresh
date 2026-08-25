const Order = require("../models/order.model");
const Product = require("../models/product.model");

// Helper to generate unique Order Number (e.g. FF-982410)
const generateOrderNumber = () => {
  return "FF-" + Math.floor(100000 + Math.random() * 900000);
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, subtotal, discount, deliveryCharge, totalAmount, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No order items provided" });
    }

    if (!shippingAddress || !shippingAddress.addressLine || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: "Valid shipping address is required" });
    }

    const orderNumber = generateOrderNumber();

    // Prepare items array
    const processedItems = items.map((item) => ({
      product: item.product || item.id || item._id,
      name: item.name,
      image: item.image || item.images?.[0] || "",
      quantity: Number(item.quantity || 1),
      price: Number(item.price),
      subtotal: Number(item.price) * Number(item.quantity || 1)
    }));

    const computedSubtotal = subtotal || processedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const computedTotal = totalAmount || computedSubtotal + (deliveryCharge || 0) - (discount || 0);

    const newOrder = await Order.create({
      user: req.user.id,
      orderNumber,
      items: processedItems,
      shippingAddress,
      subtotal: computedSubtotal,
      discount: discount || 0,
      deliveryCharge: deliveryCharge || 0,
      totalAmount: computedTotal,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      orderStatus: "Confirmed",
      notes: notes || ""
    });

    // Deduct physical batch stock in MongoDB using FEFO & record SALE stock movements
    const fefoService = require("../services/fefoService");
    for (const item of processedItems) {
      if (item.product) {
        await fefoService.deductStockFEFO(item.product, item.quantity, newOrder._id, req.user.id);
      }
    }

    // Trigger Notifications for Customer & Admin
    const { createNotificationHelper } = require("./notification.controller");
    const User = require("../models/user.model");

    // 1. Notify Customer
    await createNotificationHelper({
      recipient: req.user.id,
      title: `Order Confirmed 🛒 (#${orderNumber})`,
      message: `Your order #${orderNumber} for ₹${computedTotal} has been placed successfully and will be delivered in 2 hours!`,
      type: "ORDER_UPDATE",
      link: "/orders"
    });

    // 2. Notify Admins
    const adminUsers = await User.find({ role: "admin" });
    for (const admin of adminUsers) {
      await createNotificationHelper({
        recipient: admin._id,
        title: `New Customer Order 💰 (#${orderNumber})`,
        message: `New order #${orderNumber} received for ₹${computedTotal} (${processedItems.length} items).`,
        type: "ORDER_UPDATE",
        link: "/admin/orders"
      });
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: newOrder
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error placing order"
    });
  }
};

// @desc    Get customer's own orders
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching user orders" });
  }
};

// @desc    Get all orders (Admin Order Manipulation)
// @route   GET /api/orders
// @access  Private (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== "all") {
      query.orderStatus = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
        { "shippingAddress.phone": { $regex: search, $options: "i" } }
      ];
    }

    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching order list" });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email phone");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check permission: owner or admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized to view this order" });
    }

    return res.json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching order details" });
  }
};

// @desc    Update Order Status (Admin Manipulation)
// @route   PATCH /api/orders/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === "Delivered") {
        order.deliveredAt = new Date();
        order.paymentStatus = "Paid";
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    return res.json({
      success: true,
      message: `Order status updated to "${order.orderStatus}"`,
      data: order
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return res.status(500).json({ success: false, message: "Error updating order status" });
  }
};

// @desc    Cancel Order (Customer or Admin)
// @route   PATCH /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.orderStatus === "Delivered" || order.orderStatus === "Out for Delivery") {
      return res.status(400).json({
        success: false,
        message: "Orders already out for delivery or delivered cannot be cancelled."
      });
    }

    order.orderStatus = "Cancelled";
    await order.save();

    // Revert product stock
    for (const item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    return res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return res.status(500).json({ success: false, message: "Error cancelling order" });
  }
};

// @desc    Get assigned orders for Delivery Agent
// @route   GET /api/orders/delivery/assigned
// @access  Private (Delivery Agent / Admin)
exports.getAssignedDeliveryOrders = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "deliveryboy") {
      query.assignedDeliveryBoy = req.user.id;
    } else {
      // Admin fallback or filter
      query.orderStatus = { $in: ["Confirmed", "Processing", "Out for Delivery"] };
    }

    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get Assigned Delivery Orders Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching delivery orders" });
  }
};

// @desc    Assign Delivery Agent to Order (Admin)
// @route   PATCH /api/orders/:id/assign-delivery
// @access  Private (Admin)
exports.assignDeliveryBoy = async (req, res) => {
  try {
    const { deliveryBoyId } = req.body;
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.assignedDeliveryBoy = deliveryBoyId;
    if (order.orderStatus === "Pending") {
      order.orderStatus = "Confirmed";
    }
    await order.save();

    // Trigger Notification for Delivery Agent
    const { createNotificationHelper } = require("./notification.controller");
    await createNotificationHelper({
      recipient: deliveryBoyId,
      title: `New Delivery Assigned 🚚 (#${order.orderNumber})`,
      message: `You have been assigned order #${order.orderNumber} for delivery to ${order.shippingAddress?.fullName}.`,
      type: "ORDER_UPDATE",
      link: "/delivery/dashboard",
    });

    return res.json({
      success: true,
      message: `Delivery agent assigned to order #${order.orderNumber}`,
      data: order,
    });
  } catch (error) {
    console.error("Assign Delivery Agent Error:", error);
    return res.status(500).json({ success: false, message: "Error assigning delivery agent" });
  }
};

// @desc    Update Delivery Status & Record COD Cash (Delivery Agent)
// @route   PATCH /api/orders/:id/delivery-status
// @access  Private (Delivery Agent / Admin)
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (status) {
      order.orderStatus = status;
      if (status === "Delivered") {
        order.deliveredAt = new Date();
        order.paymentStatus = "Paid"; // Auto mark COD paid upon delivery
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    // Trigger Notification for Customer
    const { createNotificationHelper } = require("./notification.controller");
    await createNotificationHelper({
      recipient: order.user,
      title: `Order Delivery Update 🚚 (#${order.orderNumber})`,
      message:
        status === "Delivered"
          ? `🎉 Order #${order.orderNumber} has been delivered! Enjoy your fresh produce.`
          : `🚚 Your order #${order.orderNumber} is now Out for Delivery!`,
      type: "ORDER_UPDATE",
      link: "/orders",
    });

    return res.json({
      success: true,
      message: `Order #${order.orderNumber} updated to "${order.orderStatus}"`,
      data: order,
    });
  } catch (error) {
    console.error("Update Delivery Status Error:", error);
    return res.status(500).json({ success: false, message: "Error updating delivery status" });
  }
};
