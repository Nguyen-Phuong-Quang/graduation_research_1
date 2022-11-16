const cartService = require('../services/cart.service');
const CustomErrorHandler = require('../utils/CustomErrorHandler');

exports.addItemToCart = async (req, res, next) => {
    const { productId, quantity, color, size } = req.body;
    try {
        const { type, message, statusCode, cart } = await cartService.addItemToCart(req.user.email, productId, quantity, color, size);

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            cart
        })
    } catch (err) {
        next(err)
    }
}

exports.getCart = async (req, res, next) => {
    try {
        const { type, message, statusCode, cart } = await cartService.getCart(req.user.email);

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            cart
        })
    } catch (err) {
        next(err);
    }
}

exports.deleteCart = async (req, res, next) => {
    try {
        const { type, message, statusCode } = await cartService.deleteCart(req.user.email);

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

exports.deleteItem = async (req, res, next) => {
    try {
        const { type, message, statusCode, cart } = await cartService.deleteItem(
            req.user.email,
            req.params.productId,
            req.body.color,
            req.body.size
        )

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            cart
        })
    } catch (err) {
        next(err);
    }
}

exports.increaseOne = async (req, res, next) => {
    const { productId, color, size } = req.body
    try {
        const { type, statusCode, message, cart } = await cartService.increaseOne(
            req.user.email,
            productId,
            color,
            size
        )

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            cart
        })
    } catch (err) {
        next(err)
    }
}

exports.decreaseOne = async (req, res, next) => {
    const { productId, color, size } = req.body
    try {
        const { type, statusCode, message, cart } = await cartService.decreaseOne(
            req.user.email,
            productId,
            color,
            size
        )

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            cart
        })
    } catch (err) {
        next(err)
    }
}