const authService = require('../services/auth.service');
const CustomErrorHandler = require('../utils/CustomErrorHandler');

exports.register = async (req, res, next) => {
    try {
        // Sign up service called
        const { type, statusCode, message, user, verifyEmailCode } = await authService.signup(req.body, req.file);

        // Check error response
        if (type === 'Error') {
            return next(new CustomErrorHandler(statusCode, message));
        }

        // Response if success
        res.status(statusCode).json({
            type,
            message,
            user,
            verifyEmailCode
        })
    } catch (err) {
        next(err);
    }
}

exports.verifyEmail = async (req, res, next) => {
    try {
        // Call verify email service
        const { type, message, statusCode } = await authService.verifyEmail(req.body.code, req.body.email);

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type: 'Success',
            message
        })

    } catch (err) {
        next(err);
    }
}

exports.signin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Call sign in service
        const { type, statusCode, message, token } = await authService.signin(email, password);

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            token
        })
    } catch (err) {
        next(err);
    }
}

exports.refreshToken = async (req, res, next) => {
    const { refreshToken } = req.body
    try {
        // Call refresh token service
        const { type, message, statusCode, newToken } = await authService.refreshToken(refreshToken);

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            token: newToken
        })

    } catch (err) {
        next(err);
    }
}

exports.forgetPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        // Call forget password service
        const { type, message, statusCode, resetCode } = await authService.forgetPassword(email);

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            resetCode
        });

    } catch (err) {
        next(err);
    }
}

exports.resetPassword = async (req, res, next) => {
    const { resetCode, email, password, comfirmPassword } = req.body;
    try {
        // Call reset password service
        const { type, message, statusCode } = await authService.resetPassword(resetCode, email, password, comfirmPassword);

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

exports.changePassword = async (req, res, next) => {
    const { password, newPassword, confirmPassword } = req.body;
    try {
        // Call change password service
        const { type, message, statusCode } = await authService.changePassword(password, newPassword, confirmPassword, req.userId);

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message
        })
    } catch (err) {
        next(err)
    }
}

exports.signout = async (req, res, next) => {
    const userId = req.user._id;
    try {
        // Call sign out service
        const { type, statusCode, message } = await authService.signout(userId);

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