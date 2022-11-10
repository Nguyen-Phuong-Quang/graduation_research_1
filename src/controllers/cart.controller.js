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