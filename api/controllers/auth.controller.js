import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import { errorHandler } from "../utils/error.js";
import jwt from 'jsonwebtoken';

const SESSION_DAYS = 7;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// the cookie and the token expire together, so the frontend never thinks it is logged in when it isn't
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
};

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (typeof username !== 'string' || username.trim().length < 3) {
    return next(errorHandler(400, 'Username must be at least 3 characters'));
  }
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return next(errorHandler(400, 'Please enter a valid email address'));
  }
  if (typeof password !== 'string' || password.length < 6) {
    return next(errorHandler(400, 'Password must be at least 6 characters'));
  }

  try {
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({
      username: username.trim(),
      email: email.trim(),
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(errorHandler(400, 'Username or email is already in use'));
    }
    next(error);
  }
};


export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    return next(errorHandler(400, 'Please enter sign in credentials'));
  }
  try {
    const validUser = await User.findOne({ email: email.trim() });
    // same message for both cases so nobody can find out which emails are registered
    const validPassword = validUser && bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Invalid email or password'));
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, {
      expiresIn: `${SESSION_DAYS}d`,
    });
    const { password: pass, ...rest } = validUser._doc;
    res
    .cookie('access_token', token, cookieOptions)
    .status(200)
    .json(rest);
  } catch (error) {
    next(error);

  }
}

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie('access_token');
    res.status(200).json({ message: 'User signed out successfully' });
  } catch (error) {
    next(error);
  }
};
