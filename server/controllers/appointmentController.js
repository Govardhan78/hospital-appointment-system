const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, timeSlot, reason } = req.body;

    const doctor = await User.findOne({ _id: doctorId, role: "doctor", isActive: true });
    if (!doctor) {
      return errorResponse(res, 404, "Doctor not found or unavailable");
    }

    const existing = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $ne: "cancelled" },
    });
    if (existing) {
      return errorResponse(res, 409, "This time slot is already booked. Please choose another.");
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate,
      timeSlot,
      reason,
    });

    await appointment.populate([
      { path: "patient", select: "name email phone" },
      { path: "doctor", select: "name email specialization" },
    ]);

    return successResponse(res, 201, "Appointment booked successfully", appointment);
  } catch (error) {
    next(error);
  }
};

const getAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (req.user.role === "patient") {
      filter.patient = req.user._id;
    } else if (req.user.role === "doctor") {
      filter.doctor = req.user._id;
    }

    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Appointment.countDocuments(filter);

    const appointments = await Appointment.find(filter)
      .populate("patient", "name email phone bloodGroup")
      .populate("doctor", "name email specialization")
      .skip(skip)
      .limit(Number(limit))
      .sort({ appointmentDate: -1 });

    return successResponse(res, 200, "Appointments fetched", {
      appointments,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "name email phone bloodGroup")
      .populate("doctor", "name email specialization");

    if (!appointment) {
      return errorResponse(res, 404, "Appointment not found");
    }

    const isOwner =
      appointment.patient._id.toString() === req.user._id.toString() ||
      appointment.doctor._id.toString() === req.user._id.toString();

    if (!isOwner) {
      return errorResponse(res, 403, "Not authorized to view this appointment");
    }

    return successResponse(res, 200, "Appointment fetched", appointment);
  } catch (error) {
    next(error);
  }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return errorResponse(res, 404, "Appointment not found");
    }

    const isOwner =
      appointment.patient.toString() === req.user._id.toString() ||
      appointment.doctor.toString() === req.user._id.toString();

    if (!isOwner) {
      return errorResponse(res, 403, "Not authorized to cancel this appointment");
    }

    if (appointment.status === "cancelled") {
      return errorResponse(res, 400, "Appointment is already cancelled");
    }

    if (appointment.status === "completed") {
      return errorResponse(res, 400, "Cannot cancel a completed appointment");
    }

    appointment.status = "cancelled";
    appointment.cancelledBy = req.user._id;
    appointment.cancelReason = req.body.cancelReason || "No reason provided";
    await appointment.save();

    return successResponse(res, 200, "Appointment cancelled successfully", appointment);
  } catch (error) {
    next(error);
  }
};

const confirmAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return errorResponse(res, 404, "Appointment not found");
    }

    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "Only the assigned doctor can confirm this appointment");
    }

    if (appointment.status !== "pending") {
      return errorResponse(res, 400, `Cannot confirm an appointment with status: ${appointment.status}`);
    }

    appointment.status = "confirmed";
    await appointment.save();

    return successResponse(res, 200, "Appointment confirmed", appointment);
  } catch (error) {
    next(error);
  }
};

const completeAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return errorResponse(res, 404, "Appointment not found");
    }

    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "Only the assigned doctor can complete this appointment");
    }

    if (appointment.status !== "confirmed") {
      return errorResponse(res, 400, "Only confirmed appointments can be marked as completed");
    }

    appointment.status = "completed";
    appointment.notes = req.body.notes || "";
    await appointment.save();

    return successResponse(res, 200, "Appointment marked as completed", appointment);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
  confirmAppointment,
  completeAppointment,
};
