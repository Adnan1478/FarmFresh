const mongoose = require("mongoose");

const wasteRecordSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryBatch",
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      enum: ["Spoiled", "Overripe", "Damaged", "Expired", "Quality Defect", "Other"],
      default: "Spoiled",
    },
    notes: {
      type: String,
      trim: true,
    },
    costLoss: {
      type: Number,
      default: 0,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WasteRecord", wasteRecordSchema);
