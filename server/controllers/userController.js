const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const getDoctors = async (req, res, next) => {
  try {
    const { specialization, page = 1, limit = 10 } = req.query;

    const filter = { role: "doctor", isActive: true };
    if (specialization) {
      filter.specialization = { $regex: specialization, $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const doctors = await User.find(filter)
      .select("-password")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return successResponse(res, 200, "Doctors fetched successfully", {
      doctors,
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

const getPatients = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const filter = { role: "patient", isActive: true };
    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);

    const patients = await User.find(filter)
      .select("-password")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return successResponse(res, 200, "Patients fetched successfully", {
      patients,
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

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }
    return successResponse(res, 200, "User fetched", user);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDoctors, getPatients, getUserById };
