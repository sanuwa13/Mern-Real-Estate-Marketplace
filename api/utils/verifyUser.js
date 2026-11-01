import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

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

// for public routes that show extra details to signed in users; returns null instead of failing
export const getUserIdFromToken = (req) => {
    const token = req.cookies.access_token;
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET).id;
    } catch {
        return null;
    }
};
