import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import { errorHandler } from "../utils/error.js";
import { isAdminEmail } from "../utils/verifyUser.js";
import jwt from 'jsonwebtoken';

const SESSION_DAYS = 7;

// the cookie and the token expire together, so the frontend never thinks it is logged in when it isn't
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    return next(errorHandler(400, 'Please enter sign in credentials'));
  }
  try {
    // only the owner can sign in; same message for every failure so nobody learns which emails exist
    const validUser = isAdminEmail(email)
      ? await User.findOne({ email: process.env.ADMIN_EMAIL.trim().toLowerCase() })
      : null;
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
