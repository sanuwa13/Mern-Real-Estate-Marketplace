import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';

export const test = (req, res) => {
    res.json({
        message: 'Api route is working properly',
    });
};

export const updateUser = async (req, res, next) => {
    if(req.user.id !== req.params.id) { const err = new Error('You can update only your account!'); err.statusCode = 403; return next(err); }
    try {
        if(req.body.password) {
            req.body.password = bcryptjs.hashSync(req.body.password, 10)
        }

    const updatedUser = await User.findByIdAndUpdate(req.params.id,{
        $set:{
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            avatar: req.body.avatar,
        }
    }, {new: true})
    const {password, ...rest} = updatedUser._doc
    
    res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
};