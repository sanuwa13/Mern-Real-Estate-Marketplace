import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const test = (req, res) => {
  res.json({
    message: "Api route is working properly",
  });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, "You can update only your account!"));
  }
  const { username, email, password, avatar } = req.body;
  const updates = {};

  if (username !== undefined) {
    if (typeof username !== "string" || username.trim().length < 3) {
      return next(errorHandler(400, "Username must be at least 3 characters"));
    }
    updates.username = username.trim();
  }
  if (email !== undefined) {
    if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return next(errorHandler(400, "Please enter a valid email address"));
    }
    updates.email = email.trim();
  }
  if (password) {
    if (typeof password !== "string" || password.length < 6) {
      return next(errorHandler(400, "Password must be at least 6 characters"));
    }
    updates.password = bcryptjs.hashSync(password, 10);
  }
  if (avatar !== undefined) {
    if (typeof avatar !== "string") {
      return next(errorHandler(400, "Invalid avatar"));
    }
    updates.avatar = avatar;
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { returnDocument: "after" },
    );
    if (!updatedUser) return next(errorHandler(404, "User not found"));
    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    if (error.code === 11000) {
      return next(errorHandler(400, "Username or email is already in use"));
    }
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can delete only your account!"));
  try {
    await Listing.deleteMany({ userRef: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie("access_token");
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can view only your own listings!"));
  try {
    const listings = await Listing.find({ userRef: req.params.id });
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, "User not found"));
    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
