const discountService = require("../services/discount.service");
const CustomErrorHandler = require("../utils/CustomErrorHandler");

exports.getAllDiscountCodes = async (req, res, next) => {
    try {
        const { type, message, statusCode, discounts } =
            await discountService.getAllDiscountCodes(req);

        if (type === "Error")
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            discounts,
        });
    } catch (err) {
        next(err);
    }
};

exports.getDiscountCode = async (req, res, next) => {
    try {
        const { type, message, statusCode, discount } =
            await discountService.getDiscountCode(req.user.discountCodes);

        if (type === "Error")
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            discount,
        });
    } catch (err) {
        next(err);
    }
};

exports.verifyDiscountCode = async (req, res, next) => {
    try {
        const { type, message, statusCode } =
            await discountService.verifyDiscountCode(
                req.params.discountCode,
                req.user
            );

        if (type === "Error")
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
        });
    } catch (err) {
        next(err);
    }
};

exports.generateDiscountCode = async (req, res, next) => {
    try {
        const { type, message, statusCode, discount } =
            await discountService.generateDiscountCode(req.body);

        if (type === "Error")
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            discount,
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteDiscountCode = async (req, res, next) => {
    try {
        const { type, message, statusCode } =
            await discountService.deleteDiscountCode(req.params.discountId);

        if (type === "Error")
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
        });
    } catch (err) {
        next(err);
    }
};

exports.cancelDiscountCode = async (req, res, next) => {
    try {
        const { type, message, statusCode } =
            await discountService.cancelDiscountCode(
                req.params.discountCode,
                req.user
            );

        if (type === "Error")
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
        });
    } catch (err) {
        next(err);
    }
};
