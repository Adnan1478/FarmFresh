const mongoose = require("mongoose");
const Wishlist = require("../models/wishlist.model");
const Product = require("../models/product.model");

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate({
      path: "products",
      populate: { path: "category", select: "name slug image" }
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    return res.json({
      success: true,
      data: wishlist.products || []
    });
  } catch (error) {
    console.error("Get Wishlist Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching wishlist" });
  }
};

// @desc    Toggle product in wishlist (Add / Remove)
// @route   POST /api/wishlist/toggle
// @access  Private
exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    // Safe lookup for product ID (handles ObjectId or slug/custom ID)
    const isObjectId = mongoose.Types.ObjectId.isValid(productId);
    let productExists = null;

    if (isObjectId) {
      productExists = await Product.findById(productId);
    } else {
      productExists = await Product.findOne({ $or: [{ slug: productId }, { name: productId }] });
    }

    if (!productExists) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const targetId = productExists._id;
    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [targetId] });
      return res.json({
        success: true,
        action: "added",
        message: "Added to Wishlist ❤️",
        data: wishlist.products
      });
    }

    const existsIndex = wishlist.products.findIndex(
      (pId) => pId.toString() === targetId.toString()
    );

    let action = "added";
    if (existsIndex > -1) {
      // Remove product from wishlist
      wishlist.products.splice(existsIndex, 1);
      action = "removed";
    } else {
      // Add product to wishlist
      wishlist.products.push(targetId);
      action = "added";
    }

    await wishlist.save();

    return res.json({
      success: true,
      action,
      message: action === "added" ? "Saved to Wishlist ❤️" : "Removed from Wishlist",
      data: wishlist.products
    });
  } catch (error) {
    console.error("Toggle Wishlist Error:", error);
    return res.status(500).json({ success: false, message: "Error updating wishlist" });
  }
};

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
exports.clearWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (wishlist) {
      wishlist.products = [];
      await wishlist.save();
    }
    return res.json({
      success: true,
      message: "Wishlist cleared",
      data: []
    });
  } catch (error) {
    console.error("Clear Wishlist Error:", error);
    return res.status(500).json({ success: false, message: "Error clearing wishlist" });
  }
};
