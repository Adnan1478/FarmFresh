const InventoryBatch = require("../models/inventoryBatch.model");
const StockMovement = require("../models/stockMovement.model");
const WasteRecord = require("../models/wasteRecord.model");
const Product = require("../models/product.model");
const PurchaseOrder = require("../models/purchaseOrder.model");

// @desc    Get Inventory Dashboard Metrics & Summary Stats
// @route   GET /api/inventory/summary
// @access  Private (Admin)
exports.getInventorySummary = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // 1. Total Stock & Inventory Valuation
    const availableBatches = await InventoryBatch.find({ quantityAvailable: { $gt: 0 } });
    const totalStockQty = availableBatches.reduce((acc, b) => acc + b.quantityAvailable, 0);
    const totalInventoryValue = availableBatches.reduce((acc, b) => acc + b.quantityAvailable * b.costPrice, 0);

    // 2. Low Stock Count
    const products = await Product.find({ isActive: true });
    let lowStockCount = 0;
    for (const p of products) {
      const reorderLvl = p.reorderRules?.reorderLevel || 30;
      if (p.stock <= reorderLvl) {
        lowStockCount++;
      }
    }

    // 3. Expiring Soon Count (Within 7 Days)
    const expiringBatches = await InventoryBatch.find({
      quantityAvailable: { $gt: 0 },
      expiryDate: { $lte: sevenDaysFromNow, $gte: new Date() },
    });

    // 4. Today's Purchases Value
    const todayPurchases = await PurchaseOrder.find({
      status: "RECEIVED",
      receivedDate: { $gte: todayStart },
    });
    const todayPurchaseValue = todayPurchases.reduce((acc, po) => acc + po.totalAmount, 0);

    // 5. Today's Waste Loss Value
    const todayWasteRecords = await WasteRecord.find({
      createdAt: { $gte: todayStart },
    });
    const todayWasteLoss = todayWasteRecords.reduce((acc, w) => acc + (w.costLoss || 0), 0);

    return res.json({
      success: true,
      data: {
        totalStockQty: Math.round(totalStockQty),
        totalInventoryValue: Math.round(totalInventoryValue),
        lowStockCount,
        expiringSoonCount: expiringBatches.length,
        todayPurchaseValue: Math.round(todayPurchaseValue),
        todayWasteLoss: Math.round(todayWasteLoss),
      },
    });
  } catch (error) {
    console.error("Get Inventory Summary Error:", error);
    return res.status(500).json({ success: false, message: "Error loading inventory summary" });
  }
};

// @desc    Get Low Stock Alert Products
// @route   GET /api/inventory/low-stock
// @access  Private (Admin)
exports.getLowStockAlerts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).populate("category", "name");
    const alerts = [];

    for (const p of products) {
      const minStock = p.reorderRules?.minimumStock || 20;
      const reorderLvl = p.reorderRules?.reorderLevel || 30;
      const reorderQty = p.reorderRules?.reorderQuantity || 100;

      if (p.stock <= reorderLvl) {
        alerts.push({
          _id: p._id,
          name: p.name,
          category: p.category?.name || "Grocery",
          currentStock: p.stock,
          unit: p.unit,
          minimumStock: minStock,
          reorderLevel: reorderLvl,
          suggestedReorderQty: reorderQty,
          status: p.stock <= minStock ? "CRITICAL" : "WARNING",
        });
      }
    }

    return res.json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    console.error("Get Low Stock Alerts Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching low stock alerts" });
  }
};

// @desc    Get Expiring Soon Batches (FEFO Inspection)
// @route   GET /api/inventory/expiring-batches
// @access  Private (Admin)
exports.getExpiringBatches = async (req, res) => {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const batches = await InventoryBatch.find({
      quantityAvailable: { $gt: 0 },
      expiryDate: { $lte: sevenDaysFromNow },
    })
      .populate("product", "name unit price")
      .populate("supplier", "name companyName")
      .sort({ expiryDate: 1 });

    return res.json({
      success: true,
      count: batches.length,
      data: batches,
    });
  } catch (error) {
    console.error("Get Expiring Batches Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching expiring batches" });
  }
};

// @desc    Get All Stock Movements Audit Trail
// @route   GET /api/inventory/movements
// @access  Private (Admin)
exports.getStockMovements = async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};
    if (type && type !== "all") {
      query.type = type;
    }

    const movements = await StockMovement.find(query)
      .populate("product", "name unit")
      .populate("batch", "batchNumber expiryDate")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({
      success: true,
      count: movements.length,
      data: movements,
    });
  } catch (error) {
    console.error("Get Stock Movements Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching stock movements" });
  }
};
