const userService = require('../services/user.service');
const CustomErrorHandler = require('../utils/CustomErrorHandler');

// Get user
exports.getUser = async (req, res, next) => {
    const id = req.params.id;
    try {
        const { type, message, statusCode, user } = await userService.getUserById(id);

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            user
        })
    } catch (err) {
        next(err)
    }
}

// Get users by query
exports.getUsers = async (req, res, next) => {
    try {
        const { type, message, statusCode, users } = await userService.findByQueryUsers(req);

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(200).json({
            type,
            message,
            users
        })
    } catch (err) {
        next(err);
    }
}

// Create user by admin
exports.createUser = async (req, res, next) => {
    try {
        // Call sign in service
        const { type, statusCode, message, user } = await userService.createUser(req.body, req.file);

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            user
        })
    } catch (err) {
        next(err);
    }
}

// Update user detail
exports.updateUserDetail = async (req, res, next) => {
    try {
        const { type, message, statusCode, user } = await userService.updateUserDetail(req.user._id, req.body);

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            user
        })
    } catch (err) {
        next(err)
    }
}

// Update user profile
exports.updateUserProfile = async (req, res, next) => {
    try {
        const { type, message, statusCode, user } = await userService.updateUserProfile(req.user._id, req.file);

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            user
        })
    } catch (err) {
        next(err);
    }
}

// Delete user
exports.deleteUserById = async (req, res, next) => {
    const userId = req.params.id;
    try {
        const { type, message, statusCode } = await userService.deleteUserById(userId);

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message
        })
    } catch (err) {
        next(err);
    }
}