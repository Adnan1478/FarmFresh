const Coupon = require("../models/coupon.model");

// Seed initial Essential Fresh Produce Coupons if empty
const seedDefaultCoupons = async () => {
  try {
    const count = await Coupon.countDocuments();
    if (count === 0) {
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 24);

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      await Coupon.create([
        {
          code: "FRESH20",
          description: "20% OFF on fresh vegetables & fruits (Min order ₹500, Max discount ₹100)",
          discountType: "PERCENTAGE",
          discountValue: 20,
          minOrderAmount: 500,
          maxDiscountAmount: 100,
          expiresAt: nextWeek,
          usageLimit: 500,
          isActive: true,
        },
        {
          code: "WELCOME10",
          description: "Flat ₹50 OFF on your first grocery purchase over ₹300",
          discountType: "FIXED",
          discountValue: 50,
          minOrderAmount: 300,
          expiresAt: nextWeek,
          usageLimit: 1000,
          isActive: true,
        },
        {
          code: "CLEARANCE30",
          description: "Flash Clearance: 30% OFF daily produce (24h Flash Sale)",
          discountType: "PERCENTAGE",
          discountValue: 30,
          minOrderAmount: 250,
          maxDiscountAmount: 150,
          expiresAt: tomorrow,
          usageLimit: 200,
          isActive: true,
        },
      ]);
      console.log("Default FarmFresh Coupons seeded!");
    }
  } catch (err) {
    console.error("Error seeding default coupons:", err);
  }
};
seedDefaultCoupons();

// @desc    Validate Coupon Code for Customer Cart
// @route   POST /api/coupons/validate
// @access  Public
exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid coupon code" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: "This coupon is currently inactive" });
    }

    if (new Date() > new Date(coupon.expiresAt)) {
      return res.status(400).json({ success: false, message: "This flash sale coupon has expired" });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    }

    const orderSubtotal = Number(subtotal || 0);

    if (orderSubtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum spend of ₹${coupon.minOrderAmount} required for coupon ${coupon.code}`,
      });
    }

    // Calculate Discount Amount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = Math.round((orderSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else if (coupon.discountType === "FIXED") {
      discountAmount = coupon.discountValue;
    }

    // Safety Weight Math: Discount cannot exceed order subtotal
    discountAmount = Math.min(discountAmount, orderSubtotal);

    return res.json({
      success: true,
      message: `✓ Coupon ${coupon.code} applied! Discount ₹${discountAmount}`,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        minOrderAmount: coupon.minOrderAmount,
        description: coupon.description,
      },
    });
  } catch (error) {
    console.error("Validate Coupon Error:", error);
    return res.status(500).json({ success: false, message: "Error validating coupon" });
  }
};

// @desc    Create new coupon (Admin)
// @route   POST /api/coupons
// @access  Private (Admin)
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      expiresAt,
      usageLimit,
      isActive,
    } = req.body;

    if (!code || !discountType || !discountValue || !expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Code, discount type, discount value, and expiration date are required",
      });
    }

    const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      description: description ? description.trim() : "",
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      expiresAt: new Date(expiresAt),
      usageLimit: usageLimit ? Number(usageLimit) : 100,
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      message: `Coupon ${coupon.code} created successfully!`,
      data: coupon,
    });
  } catch (error) {
    console.error("Create Coupon Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Error creating coupon" });
  }
};

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private (Admin)
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    console.error("Get All Coupons Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching coupons" });
  }
};

// @desc    Update coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Private (Admin)
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    if (req.body.code) {
      req.body.code = req.body.code.trim().toUpperCase();
    }

    const updated = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });

    return res.json({
      success: true,
      message: "Coupon updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update Coupon Error:", error);
    return res.status(500).json({ success: false, message: "Error updating coupon" });
  }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private (Admin)
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    await coupon.deleteOne();

    return res.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete Coupon Error:", error);
    return res.status(500).json({ success: false, message: "Error deleting coupon" });
  }
};
