const PurchaseOrder = require("../models/purchaseOrder.model");
const InventoryBatch = require("../models/inventoryBatch.model");
const StockMovement = require("../models/stockMovement.model");
const Product = require("../models/product.model");

// @desc    Create new purchase order
// @route   POST /api/purchase-orders
// @access  Private (Admin)
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { supplier, items, expectedDeliveryDate } = req.body;

    if (!supplier || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Supplier and purchase order items are required" });
    }

    const poNumber = `PO-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 90)}`;

    const formattedItems = items.map((item) => ({
      product: item.product,
      quantityOrdered: Number(item.quantityOrdered),
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.quantityOrdered) * Number(item.unitPrice),
    }));

    const totalAmount = formattedItems.reduce((sum, i) => sum + i.subtotal, 0);

    const po = await PurchaseOrder.create({
      poNumber,
      supplier,
      items: formattedItems,
      totalAmount: Math.round(totalAmount),
      status: "ORDERED",
      orderedDate: new Date(),
      expectedDeliveryDate: expectedDeliveryDate || null,
      createdBy: req.user.id,
    });

    const populated = await PurchaseOrder.findById(po._id)
      .populate("supplier", "name companyName phone")
      .populate("items.product", "name unit price");

    return res.status(201).json({
      success: true,
      message: `Purchase order ${poNumber} created successfully!`,
      data: populated,
    });
  } catch (error) {
    console.error("Create Purchase Order Error:", error);
    return res.status(500).json({ success: false, message: "Error creating purchase order" });
  }
};

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private (Admin)
exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find()
      .populate("supplier", "name companyName phone email")
      .populate("items.product", "name unit price images")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: pos.length,
      data: pos,
    });
  } catch (error) {
    console.error("Get Purchase Orders Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching purchase orders" });
  }
};

// @desc    Receive Purchase Order -> Automatically Creates Inventory Batches & Stock Movements
// @route   PATCH /api/purchase-orders/:id/receive
// @access  Private (Admin)
exports.receivePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ success: false, message: "Purchase order not found" });
    }

    if (po.status === "RECEIVED") {
      return res.status(400).json({ success: false, message: "Purchase order has already been received into inventory" });
    }

    po.status = "RECEIVED";
    po.receivedDate = new Date();
    await po.save();

    // Iterate through items to create Inventory Batches and Stock Movements
    for (const item of po.items) {
      const batchNo = `BATCH-${po.poNumber.replace("PO-", "")}-${Math.floor(100 + Math.random() * 900)}`;

      // Default expiry date 7 days from now for received produce
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);

      const batch = await InventoryBatch.create({
        product: item.product,
        batchNumber: batchNo,
        supplier: po.supplier,
        receivedDate: new Date(),
        expiryDate: expiry,
        quantityReceived: item.quantityOrdered,
        quantityAvailable: item.quantityOrdered,
        costPrice: item.unitPrice,
        status: "AVAILABLE",
      });

      // Create Stock Movement Audit
      await StockMovement.create({
        product: item.product,
        batch: batch._id,
        type: "PURCHASE",
        quantity: item.quantityOrdered,
        reason: `PO Receiving #${po.poNumber}`,
        referenceId: po._id,
        createdBy: req.user.id,
      });

      // Update Product stock
      const allBatches = await InventoryBatch.find({
        product: item.product,
        quantityAvailable: { $gt: 0 },
      });
      const totalStock = allBatches.reduce((acc, b) => acc + b.quantityAvailable, 0);
      await Product.findByIdAndUpdate(item.product, { stock: totalStock });
    }

    return res.json({
      success: true,
      message: `Purchase order ${po.poNumber} received! Stock batches created in inventory.`,
      data: po,
    });
  } catch (error) {
    console.error("Receive Purchase Order Error:", error);
    return res.status(500).json({ success: false, message: "Error receiving purchase order" });
  }
};
