const WasteRecord = require("../models/wasteRecord.model");
const InventoryBatch = require("../models/inventoryBatch.model");
const StockMovement = require("../models/stockMovement.model");
const Product = require("../models/product.model");

// @desc    Record produce waste (spoiled / damaged / expired)
// @route   POST /api/waste
// @access  Private (Admin)
exports.recordWaste = async (req, res) => {
  try {
    const { product, batch, quantity, reason, notes } = req.body;

    if (!product || !quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product and valid waste quantity are required",
      });
    }

    const wasteQty = Number(quantity);
    let targetBatch = null;

    if (batch) {
      targetBatch = await InventoryBatch.findById(batch);
    } else {
      // Pick earliest batch if batch omitted
      targetBatch = await InventoryBatch.findOne({
        product,
        quantityAvailable: { $gt: 0 },
      }).sort({ expiryDate: 1 });
    }

    if (!targetBatch) {
      return res.status(404).json({
        success: false,
        message: "No available inventory batch found for this product to record waste against",
      });
    }

    const actualDeducted = Math.min(targetBatch.quantityAvailable, wasteQty);
    targetBatch.quantityAvailable -= actualDeducted;

    if (targetBatch.quantityAvailable === 0) {
      targetBatch.status = "DEPLETED";
    }
    await targetBatch.save();

    const costLoss = actualDeducted * (targetBatch.costPrice || 0);

    // 1. Create Waste Record
    const waste = await WasteRecord.create({
      product,
      batch: targetBatch._id,
      quantity: actualDeducted,
      reason: reason || "Spoiled",
      notes: notes || "",
      costLoss: Math.round(costLoss),
      recordedBy: req.user.id,
    });

    // 2. Create WASTE Stock Movement Audit
    await StockMovement.create({
      product,
      batch: targetBatch._id,
      type: "WASTE",
      quantity: -actualDeducted,
      reason: `Waste: ${reason || "Spoiled"}${notes ? ` - ${notes}` : ""}`,
      createdBy: req.user.id,
    });

    // 3. Sync Product total stock
    const allBatches = await InventoryBatch.find({
      product,
      quantityAvailable: { $gt: 0 },
    });
    const totalStock = allBatches.reduce((acc, b) => acc + b.quantityAvailable, 0);
    await Product.findByIdAndUpdate(product, { stock: totalStock });

    const populated = await WasteRecord.findById(waste._id)
      .populate("product", "name unit price")
      .populate("batch", "batchNumber costPrice")
      .populate("recordedBy", "name email");

    return res.status(201).json({
      success: true,
      message: `Recorded ${actualDeducted} ${populated.product?.unit || "units"} waste loss (₹${Math.round(costLoss)})`,
      data: populated,
    });
  } catch (error) {
    console.error("Record Waste Error:", error);
    return res.status(500).json({ success: false, message: "Error recording waste loss" });
  }
};

// @desc    Get all waste records
// @route   GET /api/waste
// @access  Private (Admin)
exports.getAllWasteRecords = async (req, res) => {
  try {
    const wasteRecords = await WasteRecord.find()
      .populate("product", "name unit price images")
      .populate("batch", "batchNumber costPrice")
      .populate("recordedBy", "name email")
      .sort({ createdAt: -1 });

    const totalLossAmount = wasteRecords.reduce((acc, w) => acc + (w.costLoss || 0), 0);

    return res.json({
      success: true,
      count: wasteRecords.length,
      totalLossAmount: Math.round(totalLossAmount),
      data: wasteRecords,
    });
  } catch (error) {
    console.error("Get All Waste Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching waste records" });
  }
};
