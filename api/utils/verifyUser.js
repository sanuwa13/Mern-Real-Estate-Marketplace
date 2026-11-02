import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';
import User from '../models/user.model.js';

export const isAdminEmail = (email) =>
    !!process.env.ADMIN_EMAIL &&
    typeof email === 'string' &&
    email.trim().toLowerCase() === process.env.ADMIN_EMAIL.trim().toLowerCase();

export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) {
        return next(errorHandler(401, 'You are not authenticated'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(errorHandler(403, 'Token is not valid'));
        }

        req.user = user;
        next();
    });
};

// only the site owner (ADMIN_EMAIL) gets past this, checked against the database on every request
export const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, async (err) => {
        if (err) return next(err);
        try {
            const user = await User.findById(req.user.id);
            if (!user || !isAdminEmail(user.email)) {
                return next(errorHandler(403, 'Only the site owner can do this'));
            }
            next();
        } catch (error) {
            next(error);
        }
    });
};
