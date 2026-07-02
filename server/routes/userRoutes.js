const express = require("express");
const { getDoctors, getPatients, getUserById } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/doctors", protect, getDoctors);
router.get("/patients", protect, authorize("doctor"), getPatients);
router.get("/:id", protect, getUserById);

module.exports = router;
