const express = require("express");
const { body } = require("express-validator");
const {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
  confirmAppointment,
  completeAppointment,
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("patient"),
  [
    body("doctorId").notEmpty().withMessage("Doctor ID is required"),
    body("appointmentDate").isISO8601().withMessage("Valid appointment date is required"),
    body("timeSlot").notEmpty().withMessage("Time slot is required"),
    body("reason").trim().notEmpty().withMessage("Reason is required"),
  ],
  validate,
  bookAppointment
);

router.get("/", protect, getAppointments);
router.get("/:id", protect, getAppointmentById);
router.patch("/:id/cancel", protect, cancelAppointment);
router.patch("/:id/confirm", protect, authorize("doctor"), confirmAppointment);
router.patch("/:id/complete", protect, authorize("doctor"), completeAppointment);

module.exports = router;
