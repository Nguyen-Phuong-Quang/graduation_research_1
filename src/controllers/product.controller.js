const productService = require('../services/product.service');
const CustomErrorHandler = require('../utils/CustomErrorHandler');

exports.addProduct = async (req, res, next) => {
    const { body, files, user } = req;
    try {
        const { type, message, statusCode, product } = await productService.createProduct(body, files, user);

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            product
        })
    } catch (err) {
        next(err);
    }
}

exports.updateProductDetail = async (req, res, next) => {
    try {
        const { type, message, statusCode, product } = await productService.updateProductDetail(req.params.productId, req.user._id, req.body);

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            product
        })
    } catch (err) {
        next(err);
    }
}