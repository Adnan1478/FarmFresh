const express = require("express");
const router = express.Router();
const {
  getWishlist,
  toggleWishlist,
  clearWishlist
} = require("../controllers/wishlist.controller");
const protect = require("../middlewares/auth.middleware");

router.use(protect);

router.get("/", getWishlist);
router.post("/toggle", toggleWishlist);
router.delete("/", clearWishlist);

module.exports = router;
