const VendorSupply = require("../models/vendorSupply.model");
const InventoryBatch = require("../models/inventoryBatch.model");
const Product = require("../models/product.model");
const { createNotificationHelper } = require("./notification.controller");

// @desc    Get Vendor Portal Dashboard Metrics
// @route   GET /api/vendor/dashboard
// @access  Private (Vendor)
exports.getVendorDashboard = async (req, res) => {
  try {
    const supplies = await VendorSupply.find({ vendor: req.user.id }).sort({ createdAt: -1 });

    const totalSuppliedKg = supplies.reduce((acc, s) => acc + (s.status === "ACCEPTED" || s.status === "PAID" ? s.quantityHarvested : 0), 0);
    const totalEarnings = supplies.reduce((acc, s) => acc + (s.status === "PAID" ? s.totalPayout : 0), 0);
    const pendingPayout = supplies.reduce((acc, s) => acc + (s.status === "ACCEPTED" ? s.totalPayout : 0), 0);
    const pendingInspections = supplies.filter((s) => s.status === "PENDING_INSPECTION").length;

    return res.json({
      success: true,
      data: {
        totalSuppliedKg,
        totalEarnings,
        pendingPayout,
        pendingInspections,
        suppliesCount: supplies.length,
        supplies,
      },
    });
  } catch (error) {
    console.error("Get Vendor Dashboard Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching vendor metrics" });
  }
};

// @desc    Submit new harvest batch
// @route   POST /api/vendor/supplies
// @access  Private (Vendor)
exports.submitHarvestBatch = async (req, res) => {
  try {
    const { produceName, category, harvestDate, quantityHarvested, unit, pricePerUnit } = req.body;

    if (!produceName || !quantityHarvested || !pricePerUnit) {
      return res.status(400).json({
        success: false,
        message: "Produce name, quantity, and price per unit are required",
      });
    }

    const qty = Number(quantityHarvested);
    const price = Number(pricePerUnit);
    const totalPayout = qty * price;

    const supply = await VendorSupply.create({
      vendor: req.user.id,
      produceName: produceName.trim(),
      category: category || null,
      harvestDate: harvestDate || new Date(),
      quantityHarvested: qty,
      unit: unit || "kg",
      pricePerUnit: price,
      totalPayout: Math.round(totalPayout),
      status: "PENDING_INSPECTION",
    });

    return res.status(201).json({
      success: true,
      message: "Harvest batch submitted for warehouse inspection!",
      data: supply,
    });
  } catch (error) {
    console.error("Submit Harvest Batch Error:", error);
    return res.status(500).json({ success: false, message: "Error submitting harvest batch" });
  }
};

// @desc    Get all vendor supplies (Admin or Vendor)
// @route   GET /api/vendor/supplies
// @access  Private (Vendor / Admin)
exports.getVendorSupplies = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "vendor") {
      query.vendor = req.user.id;
    }

    const supplies = await VendorSupply.find(query)
      .populate("vendor", "name companyName email phone")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: supplies.length,
      data: supplies,
    });
  } catch (error) {
    console.error("Get Vendor Supplies Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching supplies" });
  }
};

// @desc    Update supply inspection status & record payout (Admin)
// @route   PATCH /api/vendor/supplies/:id/status
// @access  Private (Admin)
exports.updateSupplyStatus = async (req, res) => {
  try {
    const { status, qualityNotes, productId } = req.body;
    const supply = await VendorSupply.findById(req.params.id);

    if (!supply) {
      return res.status(404).json({ success: false, message: "Supply shipment not found" });
    }

    const oldStatus = supply.status;
    if (status) supply.status = status;
    if (qualityNotes !== undefined) supply.qualityNotes = qualityNotes;

    await supply.save();

    // Auto-create Inventory Batch if Admin Accepts Shipment
    if (oldStatus !== "ACCEPTED" && status === "ACCEPTED" && productId) {
      const product = await Product.findById(productId);
      if (product) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7); // Default 7-day produce shelf life

        const batchNumber = `BATCH-VND-${Date.now().toString().slice(-6)}`;
        await InventoryBatch.create({
          batchNumber,
          product: product._id,
          receivedDate: new Date(),
          expiryDate,
          quantityReceived: supply.quantityHarvested,
          quantityAvailable: supply.quantityHarvested,
          costPrice: supply.pricePerUnit,
          sellingPrice: product.price,
          status: "AVAILABLE",
        });

        // Update product stock
        product.stock += supply.quantityHarvested;
        await product.save();
      }
    }

    // Trigger Notification for Vendor
    await createNotificationHelper({
      recipient: supply.vendor,
      title: `Harvest Shipment ${status.replace("_", " ")} 🌾`,
      message: `Your harvest batch "${supply.produceName}" (${supply.quantityHarvested} ${supply.unit}) has been marked as "${status}".`,
      type: "SYSTEM",
      link: "/vendor/dashboard",
    });

    return res.json({
      success: true,
      message: `Supply shipment status updated to ${supply.status}`,
      data: supply,
    });
  } catch (error) {
    console.error("Update Supply Status Error:", error);
    return res.status(500).json({ success: false, message: "Error updating supply status" });
  }
};
