const favouriteService = require("../services/favourite.service");
const CustomErrorHandler = require("../utils/CustomErrorHandler");

exports.addToFavourite = async (req, res, next) => {
    try {
        const { type, message, statusCode } =
            await favouriteService.addToFavourite(
                req.user._id,
                req.params.productId
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

exports.deleteProductFromFavourite = async (req, res, next) => {
    try {
        const { type, message, statusCode } =
            await favouriteService.deleteProductFromFavourite(
                req.user._id,
                req.params.productId
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

exports.getFavouriteList = async (req, res, next) => {
    try {
        const { type, message, statusCode, favourite } =
            await favouriteService.getFavouriteList(req.user._id);

        if (type === "Error")
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            favourite,
        });
    } catch (err) {
        next(err);
    }
};

exports.checkProductInFavouriteList = async (req, res, next) => {
    try {
        const { type, message, statusCode } =
            await favouriteService.checkProductInFavouriteList(
                req.user._id,
                req.params.productId
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
