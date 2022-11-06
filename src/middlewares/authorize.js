const UserSchema = require("../models/UserSchema");
const CustomErrorHandler = require("../utils/CustomErrorHandler");
const jwt = require('jsonwebtoken');
const config = require("../config/config");
const TokenSchema = require("../models/TokenSchema");

module.exports = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        const token = authorization && authorization.split(' ')[1];

        if (!token)
            return next(new CustomErrorHandler(401, 'Please login!'));

        const tokenDoc = await TokenSchema.findOne({ token });

        if(!tokenDoc) 
            return next(new CustomErrorHandler(404, 'No token found!'))

        const decoded = jwt.verify(token, config.jwt.jwt_secret);

        const user = await UserSchema.findById(decoded.userId).select('role');

        if (!user)
            return next(new CustomErrorHandler(401, 'User belonging to this token does not exist!'));

        if (user.isChangePasswordAfter(decoded.iat))
            return next(new CustomErrorHandler(401, 'Password was changed, please login again!'));

        req.user = user;
        next()
    } catch (err) {
        next(err);
    }
}