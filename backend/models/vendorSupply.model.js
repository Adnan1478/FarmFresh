const mongoose = require("mongoose");

const vendorSupplySchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    produceName: {
      type: String,
      required: [true, "Produce name is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    harvestDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    quantityHarvested: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: String,
      default: "kg",
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPayout: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING_INSPECTION", "ACCEPTED", "REJECTED", "PAID"],
      default: "PENDING_INSPECTION",
    },
    qualityNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("VendorSupply", vendorSupplySchema);
