const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
    },
    reason: {
      type: String,
      required: [true, "Reason for appointment is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancelReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: "cancelled" } } }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
