const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const register = async (req, res, next) => {
  try {
    const {
      name, email, password, role, phone,
      specialization, experience, availableDays,
      dateOfBirth, bloodGroup,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, "Email already registered");
    }

    const userData = { name, email, password, role, phone };

    if (role === "doctor") {
      userData.specialization = specialization;
      userData.experience = experience;
      userData.availableDays = availableDays || [];
    }

    if (role === "patient") {
      userData.dateOfBirth = dateOfBirth;
      userData.bloodGroup = bloodGroup;
    }

    const user = await User.create(userData);
    const token = generateToken(user._id, user.role);

    return successResponse(res, 201, "Registration successful", {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    if (!user.isActive) {
      return errorResponse(res, 403, "Your account has been deactivated");
    }

    const token = generateToken(user._id, user.role);

    return successResponse(res, 200, "Login successful", {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return successResponse(res, 200, "Profile fetched", user);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
