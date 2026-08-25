const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/emailService");

// Generate JWT Token Helper with strict expiry
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET || "fallbackSecret123",
    { expiresIn: "1d" } // Session expires in 24 hours
  );
};

// Cookie Options Helper
const getCookieOptions = () => ({
  httpOnly: true, // Prevents XSS script access to session token
  secure: process.env.NODE_ENV === "production", // Transmitted over HTTPS in production
  sameSite: "lax", // Protects against CSRF attacks
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
});

// @desc    Register a new user with Email Verification
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, username, email, password, phone } = req.body;

    const userEmail = email || (username && username.includes("@") ? username : null);
    const userName = name || username;

    if (!userEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Strong Password Complexity Rule (Min 8 chars)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const cleanEmail = userEmail.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists",
      });
    }

    // Hash password with 12 bcrypt rounds for GPU cracking resistance
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User instance
    const newUser = new User({
      name: userName ? userName.trim() : "Customer",
      email: cleanEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : "",
      role: "customer",
      isEmailVerified: false,
    });

    // Generate SHA-256 hashed Email Verification Token
    const plainVerificationToken = newUser.createEmailVerificationToken();
    await newUser.save();

    // Send Email Verification Link
    try {
      await sendVerificationEmail(newUser.email, plainVerificationToken);
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr);
    }

    const token = generateToken(newUser);
    res.cookie("token", token, getCookieOptions());

    return res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
      token,
      user: newUser.toJSON(),
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration. Please try again.",
    });
  }
};

// @desc    Login user with Account Lockout & Brute-Force Protection
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const loginInput = email || username;

    if (!loginInput || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email/username and password",
      });
    }

    const cleanInput = loginInput.trim().toLowerCase();

    // Query user including password & security lock fields
    const user = await User.findOne({
      $or: [{ email: cleanInput }, { name: loginInput.trim() }],
    }).select("+password +failedLoginAttempts +lockUntil");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/username or password",
      });
    }

    // Check Account Lockout State
    if (user.isLocked()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
      });
    }

    // Compare Password Hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed login counter & lock if attempts >= 5
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: "Invalid email/username or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    // Reset failed attempts on successful login
    await user.resetLoginAttempts();

    const token = generateToken(user);
    res.cookie("token", token, getCookieOptions());

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login. Please try again.",
    });
  }
};

// @desc    Get authenticated user session (/me)
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    return res.json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error restoring user session.",
    });
  }
};

// @desc    Logout user & clear secure cookie
// @route   POST /api/auth/logout
// @access  Public
exports.logoutUser = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};

// @desc    Initiate Secure Password Reset Flow (SHA-256 Hashed Token & 15-min Expiry)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    // Prevent User Enumeration Attack: Return success message regardless of whether email exists
    if (!user) {
      return res.json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate SHA-256 hashed password reset token (15-min expiration)
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send email with unhashed token in link
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailErr) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        success: false,
        message: "Error sending password reset email. Please try again later.",
      });
    }

    return res.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing password reset request",
    });
  }
};

// @desc    Verify Reset Token & Set New Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    // Hash incoming URL token with SHA-256 to compare against DB string
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with matching token that has NOT expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password +resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired",
      });
    }

    // Hash new password with 12 bcrypt rounds
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Clear login attempts
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    return res.json({
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error resetting password",
    });
  }
};

// @desc    Verify Email Address via Token
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email verification link is invalid or has expired",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    return res.json({
      success: true,
      message: "Email address verified successfully!",
    });
  } catch (error) {
    console.error("Verify Email Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying email address",
    });
  }
};

// @desc    Resend Email Verification Link
// @route   POST /api/auth/resend-verification
// @access  Private
exports.resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: "Your email is already verified" });
    }

    const plainToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    await sendVerificationEmail(user.email, plainToken);

    return res.json({
      success: true,
      message: "Verification email re-sent! Please check your inbox.",
    });
  } catch (error) {
    console.error("Resend Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending verification email",
    });
  }
};

// @desc    Update User Profile
// @route   PATCH /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, avatar, address } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: "An account with this email already exists" });
      }
      user.email = email.toLowerCase();
      user.isEmailVerified = false; // Require re-verification if email changes
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (address !== undefined) user.address = address;

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ success: false, message: "Error updating profile." });
  }
};

// @desc    Change Password with 12 bcrypt rounds
// @route   PATCH /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect current password",
      });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ success: false, message: "Error changing password." });
  }
};
