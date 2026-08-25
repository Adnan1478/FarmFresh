const mongoose = require("mongoose");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

// Helper to compute total amount
const calculateCartTotal = (items) => {
  return items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
};

// @desc    Get user cart from MongoDB
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate({
      path: "items.product",
      populate: { path: "category", select: "name slug image" }
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [], totalAmount: 0 });
    }

    return res.json({
      success: true,
      data: cart.items || [],
      totalAmount: cart.totalAmount || 0
    });
  } catch (error) {
    console.error("Get Cart Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching cart from database" });
  }
};

// @desc    Add product to cart or increment quantity in MongoDB
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    // Safe lookup for product ID (handles ObjectId or slug)
    const isObjectId = mongoose.Types.ObjectId.isValid(productId);
    let product = null;

    if (isObjectId) {
      product = await Product.findById(productId);
    } else {
      product = await Product.findOne({ $or: [{ slug: productId }, { name: productId }] });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const price = product.discountPrice || product.price;
    const addQty = Math.max(1, Number(quantity));

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [{ product: product._id, quantity: addQty, price }],
        totalAmount: price * addQty
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === product._id.toString()
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += addQty;
        cart.items[itemIndex].price = price;
      } else {
        cart.items.push({ product: product._id, quantity: addQty, price });
      }

      cart.totalAmount = calculateCartTotal(cart.items);
      await cart.save();
    }

    // Populate for response
    const populated = await Cart.findById(cart._id).populate({
      path: "items.product",
      populate: { path: "category", select: "name slug image" }
    });

    return res.json({
      success: true,
      message: `Added ${product.name} to Cart`,
      data: populated.items,
      totalAmount: populated.totalAmount
    });
  } catch (error) {
    console.error("Add To Cart Error:", error);
    return res.status(500).json({ success: false, message: "Error adding item to cart in database" });
  }
};

// @desc    Update cart item quantity in MongoDB
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, delta } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not in cart" });
    }

    let newQty = cart.items[itemIndex].quantity;
    if (quantity !== undefined) {
      newQty = Number(quantity);
    } else if (delta !== undefined) {
      newQty += Number(delta);
    }

    if (newQty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = newQty;
    }

    cart.totalAmount = calculateCartTotal(cart.items);
    await cart.save();

    const populated = await Cart.findById(cart._id).populate({
      path: "items.product",
      populate: { path: "category", select: "name slug image" }
    });

    return res.json({
      success: true,
      message: "Cart quantity updated",
      data: populated.items,
      totalAmount: populated.totalAmount
    });
  } catch (error) {
    console.error("Update Cart Quantity Error:", error);
    return res.status(500).json({ success: false, message: "Error updating cart quantity" });
  }
};

// @desc    Remove item from cart in MongoDB
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
      cart.totalAmount = calculateCartTotal(cart.items);
      await cart.save();
    }

    const populated = await Cart.findById(cart._id).populate({
      path: "items.product",
      populate: { path: "category", select: "name slug image" }
    });

    return res.json({
      success: true,
      message: "Item removed from cart",
      data: populated ? populated.items : [],
      totalAmount: populated ? populated.totalAmount : 0
    });
  } catch (error) {
    console.error("Remove From Cart Error:", error);
    return res.status(500).json({ success: false, message: "Error removing item from cart" });
  }
};

// @desc    Clear user cart in MongoDB
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();
    }
    return res.json({
      success: true,
      message: "Cart cleared",
      data: [],
      totalAmount: 0
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);
    return res.status(500).json({ success: false, message: "Error clearing cart" });
  }
};
