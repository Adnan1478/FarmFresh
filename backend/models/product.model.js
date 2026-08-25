const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    images: [
      {
        type: String,
      },
    ],

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
    },

    unit: {
      type: String,
      enum: ["kg", "gram", "piece", "dozen", "liter"],
      required: true,
    },

    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    reorderRules: {
      minimumStock: { type: Number, default: 20 },
      reorderLevel: { type: Number, default: 30 },
      reorderQuantity: { type: Number, default: 100 },
    },

    unitConversions: {
      crate: { type: Number, default: 20 },
      kg: { type: Number, default: 1 },
      gram: { type: Number, default: 0.001 },
    },

    minOrderQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    maxOrderQuantity: {
      type: Number,
      default: 20,
      min: 1,
    },

    isOrganic: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model("Product", productSchema);
