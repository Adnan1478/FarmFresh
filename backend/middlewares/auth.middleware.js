const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please sign in."
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallbackSecret123"
    );

    const userDoc = await User.findById(decoded.id).select("-password");
    if (!userDoc) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists."
      });
    }

    if (!userDoc.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated by the Administrator. Inactive users cannot perform any activity."
      });
    }

    req.user = {
      id: userDoc._id.toString(),
      _id: userDoc._id,
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
      isActive: userDoc.isActive
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid token. Please sign in again."
    });
  }
};

module.exports = protect;