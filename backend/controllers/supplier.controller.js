const Supplier = require("../models/supplier.model");

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private (Admin)
exports.createSupplier = async (req, res) => {
  try {
    const { name, companyName, email, phone, address, gstin } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "Supplier name and phone are required" });
    }

    const supplier = await Supplier.create({
      name: name.trim(),
      companyName: companyName ? companyName.trim() : "",
      email: email ? email.trim().toLowerCase() : "",
      phone: phone.trim(),
      address: address ? address.trim() : "",
      gstin: gstin ? gstin.trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "Supplier added successfully",
      data: supplier,
    });
  } catch (error) {
    console.error("Create Supplier Error:", error);
    return res.status(500).json({ success: false, message: "Error creating supplier" });
  }
};

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private (Admin)
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    return res.json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    console.error("Get Suppliers Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching suppliers" });
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Admin)
exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }
    return res.json({
      success: true,
      message: "Supplier updated successfully",
      data: supplier,
    });
  } catch (error) {
    console.error("Update Supplier Error:", error);
    return res.status(500).json({ success: false, message: "Error updating supplier" });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin)
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }
    return res.json({ success: true, message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Delete Supplier Error:", error);
    return res.status(500).json({ success: false, message: "Error deleting supplier" });
  }
};
