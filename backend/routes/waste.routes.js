const express = require("express");
const router = express.Router();
const { recordWaste, getAllWasteRecords } = require("../controllers/waste.controller");
const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.post("/", protect, authorizeRoles("admin"), recordWaste);
router.get("/", protect, authorizeRoles("admin"), getAllWasteRecords);

module.exports = router;
