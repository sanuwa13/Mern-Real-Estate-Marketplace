import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) { 
        const err = new Error('You are not authenticated'); 
        err.statusCode = 401; 
        return next(err); 
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            const errorObj = new Error('Token is not valid');
            errorObj.statusCode = 403;
            return next(errorObj);
        }

        req.user = user;
        next();
    });
};