const InventoryBatch = require("../models/inventoryBatch.model");
const StockMovement = require("../models/stockMovement.model");
const Product = require("../models/product.model");

// @desc    Create new inventory batch
// @route   POST /api/batches
// @access  Private (Admin)
exports.createBatch = async (req, res) => {
  try {
    const {
      product,
      batchNumber,
      supplier,
      receivedDate,
      expiryDate,
      quantityReceived,
      costPrice,
    } = req.body;

    if (!product || !quantityReceived || !costPrice) {
      return res.status(400).json({
        success: false,
        message: "Product, quantity received, and cost price are required",
      });
    }

    const generatedBatchNo =
      batchNumber || `BATCH-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 90)}`;

    const qty = Number(quantityReceived);

    const batch = await InventoryBatch.create({
      product,
      batchNumber: generatedBatchNo,
      supplier: supplier || null,
      receivedDate: receivedDate || new Date(),
      expiryDate: expiryDate || null,
      quantityReceived: qty,
      quantityAvailable: qty,
      costPrice: Number(costPrice),
      status: "AVAILABLE",
    });

    // Create PURCHASE Stock Movement
    await StockMovement.create({
      product,
      batch: batch._id,
      type: "PURCHASE",
      quantity: qty,
      reason: "Manual Batch Receiving",
      createdBy: req.user.id,
    });

    // Sync Product total stock
    const allBatches = await InventoryBatch.find({
      product,
      quantityAvailable: { $gt: 0 },
    });
    const totalStock = allBatches.reduce((acc, b) => acc + b.quantityAvailable, 0);
    await Product.findByIdAndUpdate(product, { stock: totalStock });

    const populated = await InventoryBatch.findById(batch._id)
      .populate("product", "name unit price")
      .populate("supplier", "name companyName");

    return res.status(201).json({
      success: true,
      message: "Inventory batch added successfully!",
      data: populated,
    });
  } catch (error) {
    console.error("Create Batch Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Error creating batch" });
  }
};

// @desc    Get all inventory batches
// @route   GET /api/batches
// @access  Private (Admin)
exports.getAllBatches = async (req, res) => {
  try {
    const { status, productId } = req.query;
    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }
    if (productId) {
      query.product = productId;
    }

    const batches = await InventoryBatch.find(query)
      .populate("product", "name unit price images")
      .populate("supplier", "name companyName phone")
      .sort({ expiryDate: 1, createdAt: -1 });

    return res.json({
      success: true,
      count: batches.length,
      data: batches,
    });
  } catch (error) {
    console.error("Get All Batches Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching batches" });
  }
};

// @desc    Update batch
// @route   PUT /api/batches/:id
// @access  Private (Admin)
exports.updateBatch = async (req, res) => {
  try {
    const batch = await InventoryBatch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    const updated = await InventoryBatch.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("product", "name unit")
      .populate("supplier", "name companyName");

    // Sync Product stock
    const allBatches = await InventoryBatch.find({
      product: batch.product,
      quantityAvailable: { $gt: 0 },
    });
    const totalStock = allBatches.reduce((acc, b) => acc + b.quantityAvailable, 0);
    await Product.findByIdAndUpdate(batch.product, { stock: totalStock });

    return res.json({
      success: true,
      message: "Batch updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update Batch Error:", error);
    return res.status(500).json({ success: false, message: "Error updating batch" });
  }
};

// @desc    Delete batch
// @route   DELETE /api/batches/:id
// @access  Private (Admin)
exports.deleteBatch = async (req, res) => {
  try {
    const batch = await InventoryBatch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    const productId = batch.product;
    await batch.deleteOne();

    // Sync Product stock
    const allBatches = await InventoryBatch.find({
      product: productId,
      quantityAvailable: { $gt: 0 },
    });
    const totalStock = allBatches.reduce((acc, b) => acc + b.quantityAvailable, 0);
    await Product.findByIdAndUpdate(productId, { stock: totalStock });

    return res.json({
      success: true,
      message: "Batch deleted successfully",
    });
  } catch (error) {
    console.error("Delete Batch Error:", error);
    return res.status(500).json({ success: false, message: "Error deleting batch" });
  }
};
