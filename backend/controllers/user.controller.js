const User = require("../models/user.model");

// @desc    Get all users (Admin User Management)
// @route   GET /api/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, status } = req.query;
    let query = {};

    if (role && role !== "all") {
      query.role = role;
    }

    if (status && status !== "all") {
      query.isActive = status === "active";
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(query).select("-password").sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching users list" });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching user details" });
  }
};

// @desc    Update User Active / Inactive Status (Admin Control)
// @route   PATCH /api/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Guard: Admin cannot deactivate their own active account
    if (user._id.toString() === req.user.id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: "Safety Guard: You cannot deactivate your own logged-in admin account!"
      });
    }

    user.isActive = Boolean(isActive);
    await user.save();

    const statusLabel = user.isActive ? "Active" : "Inactive";

    return res.json({
      success: true,
      message: `User account for "${user.name}" is now ${statusLabel}`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error("Update User Status Error:", error);
    return res.status(500).json({ success: false, message: "Error modifying user status" });
  }
};

// @desc    Update User Role (Admin Control)
// @route   PATCH /api/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["customer", "admin", "vendor", "deliveryboy"];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Allowed roles: customer, admin, vendor, deliveryboy"
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.role = role;
    await user.save();

    return res.json({
      success: true,
      message: `User role updated to "${role}"`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error("Update User Role Error:", error);
    return res.status(500).json({ success: false, message: "Error updating user role" });
  }
};

// @desc    Delete User (Admin Control)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own logged-in admin account!"
      });
    }

    await user.deleteOne();

    return res.json({
      success: true,
      message: `User "${user.name}" deleted successfully`
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({ success: false, message: "Error deleting user" });
  }
};
