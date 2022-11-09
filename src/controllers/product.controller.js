const productService = require('../services/product.service');
const CustomErrorHandler = require('../utils/CustomErrorHandler');

exports.getProductById = async (req, res, next) => {
    try {
        const { type, message, statusCode, product } = await productService.getProductById(req.params.productId);

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            product
        })
    } catch (err) {
        next(err)
    }
}

exports.getAllProducts = async (req, res, next) => {
    try {
        const { type, message, statusCode, products } = await productService.getAllProductsByQuery(req);

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            products
        })
    } catch (err) {
        next(err);
    }
}

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

exports.updateProductImages = async (req, res, next) => {
    try {
        const { type, message, statusCode } = await productService.updateProductImages(req.params.productId, req.user._id, req.files);

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

exports.deleteProductById = async (req, res, next) => {
    try {
        const { type, message, statusCode } = await productService.deleteProductById(req.params.productId, req.user._id);

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

exports.addColor = async (req, res, next) => {
    try {
        const { type, message, statusCode, color } = await productService.addColor(req.params.productId, req.user._id, req.body.color);

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            color
        })
    } catch (err) {
        next(err);
    }
}

exports.deleteColor = async (req, res, next) => {
    try {
        const { type, message, statusCode } = await productService.deleteColor(req.params.productId, req.user._id, req.body.color);

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

exports.addSize = async (req, res, next) => {
    try {
        const { type, message, statusCode, size } = await productService.addSize(req.params.productId, req.user._id, req.body.size);

        if (type === 'Error')
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            size
        })
    } catch (err) {
        next(err);
    }
}

exports.deleteSize = async (req, res, next) => {
    try {
        const { type, message, statusCode } = await productService.deleteSize(req.params.productId, req.user._id, req.body.size);

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