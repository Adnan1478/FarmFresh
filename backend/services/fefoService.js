const InventoryBatch = require("../models/inventoryBatch.model");
const StockMovement = require("../models/stockMovement.model");
const Product = require("../models/product.model");

/**
 * FEFO (First Expired, First Out) Stock Deduction Service
 * Consumes stock from batches with the earliest expiry dates first.
 *
 * @param {ObjectId} productId - MongoDB ID of product
 * @param {Number} requiredQuantity - Quantity to deduct
 * @param {ObjectId} referenceId - Order ID or reference
 * @param {ObjectId} createdBy - User ID
 */
exports.deductStockFEFO = async (productId, requiredQuantity, referenceId = null, createdBy = null) => {
  let remainingNeeded = Number(requiredQuantity);
  if (remainingNeeded <= 0) return true;

  // 1. Fetch available batches sorted by expiryDate ascending (FEFO)
  const batches = await InventoryBatch.find({
    product: productId,
    quantityAvailable: { $gt: 0 },
    status: { $in: ["AVAILABLE", "LOW_STOCK"] },
  }).sort({ expiryDate: 1, receivedDate: 1 });

  let totalDeducted = 0;

  for (const batch of batches) {
    if (remainingNeeded <= 0) break;

    const qtyToDeductFromBatch = Math.min(batch.quantityAvailable, remainingNeeded);

    batch.quantityAvailable -= qtyToDeductFromBatch;
    remainingNeeded -= qtyToDeductFromBatch;
    totalDeducted += qtyToDeductFromBatch;

    // Update batch status
    if (batch.quantityAvailable === 0) {
      batch.status = "DEPLETED";
    } else if (batch.quantityAvailable <= 10) {
      batch.status = "LOW_STOCK";
    }

    await batch.save();

    // Create Stock Movement Audit Record
    await StockMovement.create({
      product: productId,
      batch: batch._id,
      type: "SALE",
      quantity: -qtyToDeductFromBatch,
      reason: `Customer Sale Order ${referenceId ? `#${referenceId}` : ""}`,
      referenceId,
      createdBy,
    });
  }

  // Sync Product total stock with remaining available batch quantities
  const allBatches = await InventoryBatch.find({
    product: productId,
    quantityAvailable: { $gt: 0 },
  });
  const currentTotalStock = allBatches.reduce((sum, b) => sum + b.quantityAvailable, 0);

  await Product.findByIdAndUpdate(productId, { stock: currentTotalStock });

  return totalDeducted;
};
