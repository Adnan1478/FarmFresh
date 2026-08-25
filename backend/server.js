const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const helmet = require("helmet");
const connectDB = require("./config/db");
const { apiLimiter } = require("./middlewares/rateLimiter.middleware");
const { sanitizeInputMiddleware } = require("./middlewares/sanitize.middleware");

dotenv.config();
connectDB();

const app = express();

// Security HTTP Headers & Server Banner Suppression
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for cross-origin media rendering compatibility
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.disable("x-powered-by");

// Global API Rate Limiter
app.use("/api", apiLimiter);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" })); // Prevent Payload Overload DoS
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Express 5 Compatible NoSQL & XSS Input Sanitizer Middleware
app.use(sanitizeInputMiddleware);

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount API Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/upload", require("./routes/upload.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/wishlist", require("./routes/wishlist.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/contact", require("./routes/contact.routes"));
app.use("/api/reviews", require("./routes/review.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/coupons", require("./routes/coupon.routes"));
app.use("/api/vendor", require("./routes/vendor.routes"));
app.use("/api/payment", require("./routes/payment.routes"));

// Mount Inventory & Supply Chain Routes
app.use("/api/inventory", require("./routes/inventory.routes"));
app.use("/api/batches", require("./routes/batch.routes"));
app.use("/api/waste", require("./routes/waste.routes"));
app.use("/api/suppliers", require("./routes/supplier.routes"));
app.use("/api/purchase-orders", require("./routes/purchaseOrder.routes"));

// Health Check API
app.get("/", (req, res) => {
  res.json({ success: true, message: "FarmFresh Backend API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
