const orderService = require("../services/order.service");
const CustomErrorHandler = require("../utils/CustomErrorHandler");

exports.createOrder = async (req, res, next) => {
    try {
        const { type, message, statusCode, order } =
            await orderService.createOrder(req.body, req.user);

        if (type === "Error")
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            order,
        });
    } catch (err) {
        next(err);
    }
};

exports.getOrdersByQuery = async (req, res, next) => {
    try {
        if (!req.query.limit) req.query.limit = 10;

        const { type, message, statusCode, orders } =
            await orderService.getOrdersByQuery(req);

        if (type === "Error")
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            orders,
        });
    } catch (err) {
        next(err);
    }
};

exports.getOrderById = async (req, res, next) => {
    try {
        const { type, message, statusCode, order } =
            await orderService.getOrderById(req.params.orderId);

        if (type === "Error")
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            order,
        });
    } catch (err) {
        next(err);
    }
};

exports.cancelOrder = async (req, res, next) => {
    try {
        const { type, message, statusCode } = await orderService.cancelOrder(
            req.params.orderId
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

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { type, message, statusCode } =
            await orderService.updateOrderStatus(
                req.body.status,
                req.params.orderId
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
