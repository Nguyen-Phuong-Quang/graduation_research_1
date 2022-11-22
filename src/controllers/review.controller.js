const reviewService = require("../services/review.service");
const CustomErrorHandler = require("../utils/CustomErrorHandler");

exports.addReview = async (req, res, next) => {
    try {
        const { type, message, statusCode, review } =
            await reviewService.addReview(
                req.params.productId,
                req.user._id,
                req.body
            );

        if (type === "Error")
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            review,
        });
    } catch (err) {
        next(err);
    }
};

exports.updateReview = async (req, res, next) => {
    const { productId, reviewId } = req.params;
    try {
        const { type, message, statusCode, review } =
            await reviewService.updateReview(
                req.user._id,
                productId,
                reviewId,
                req.body
            );

        if (type === "Error")
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            review,
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteReview = async (req, res, next) => {
    const { productId, reviewId } = req.params;

    try {
        const { type, message, statusCode } = await reviewService.deleteReview(
            req.user._id,
            productId,
            reviewId
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

exports.getReviewById = async (req, res, next) => {
    try {
        const { type, message, statusCode, review } =
            await reviewService.getReviewById(
                req.params.productId,
                req.params.reviewId
            );

        if (type === "Error")
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            review,
        });
    } catch (err) {
        next(err);
    }
};

exports.getAllReviews = async (req, res, next) => {
    try {
        if (!req.query.limit) req.query.limit = 3;

        const { type, message, statusCode, reviews } =
            await reviewService.getAllReviews(req);

        if (type === "Error")
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            reviews,
        });
    } catch (err) {
        next(err);
    }
};
