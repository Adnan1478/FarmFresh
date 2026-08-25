const express = require("express");
const router = express.Router();
const {
  createBatch,
  getAllBatches,
  updateBatch,
  deleteBatch,
} = require("../controllers/batch.controller");
const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.post("/", protect, authorizeRoles("admin"), createBatch);
router.get("/", protect, authorizeRoles("admin"), getAllBatches);
router.put("/:id", protect, authorizeRoles("admin"), updateBatch);
router.delete("/:id", protect, authorizeRoles("admin"), deleteBatch);

module.exports = router;
