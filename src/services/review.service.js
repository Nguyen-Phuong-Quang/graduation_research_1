const ProductSchema = require("../models/ProductSchema");
const ReviewSchema = require("../models/ReviewSchema");
const apiFeature = require("../utils/apiFeatures");

exports.addReview = async (productId, userId, body) => {
    const product = await ProductSchema.findById(productId);

    if (!product)
        return {
            type: "Error",
            message: "Product not found!",
            statusCode: 404,
        };

    const { review, rating } = body;

    if (!review || !rating)
        return {
            type: "Error",
            message: "Missing field!",
            statusCode: 400,
        };

    if (rating < 1)
        return {
            type: "Error",
            message: "Rating must greater than or equal to 1",
        };

    if (rating > 5)
        return {
            type: "Error",
            message: "Rating must less than or equal to 5",
        };

    const isExited = await ReviewSchema.find({
        user: userId,
        product: productId,
    });

    if (isExited.length !== 0)
        return {
            type: "Error",
            message: "Only one review allowed!",
            statusCode: 400,
        };

    const newReview = await ReviewSchema.create({
        user: userId,
        product: productId,
        rating,
        review,
    });

    return {
        type: "Success",
        message: "Create review successfully!",
        statusCode: 200,
        review: newReview,
    };
};

exports.updateReview = async (userId, productId, reviewId, body) => {
    const review = await ReviewSchema.findOne({
        _id: reviewId,
        product: productId,
    });

    if (!review)
        return {
            type: "Error",
            message: "Review not found!",
            statusCode: 404,
        };

    if (userId.toString() !== review.user.toString())
        return {
            type: "Error",
            message: "You don't have permission to edit this comment!",
            statusCode: 404,
        };

    if (body.rating < 1)
        return {
            type: "Error",
            message: "Rating must greater than or equal to 1",
        };

    if (body.rating > 5)
        return {
            type: "Error",
            message: "Rating must less than or equal to 5",
        };

    const updateReview = await ReviewSchema.findByIdAndUpdate(reviewId, body, {
        new: true,
        runValidators: true,
    });

    await ReviewSchema.calculateAverageRatings(updateReview.product);

    return {
        type: "Success",
        message: "Update review successfully!",
        statusCode: 200,
        review: updateReview,
    };
};

exports.deleteReview = async (userId, productId, reviewId) => {
    const review = await ReviewSchema.findOne({
        _id: reviewId,
        product: productId,
    });

    if (!review)
        return {
            type: "Error",
            message: "Review not found!",
            statusCode: 404,
        };

    if (userId.toString() !== review.user.toString())
        return {
            type: "Error",
            message: "You don't have permission to delete this comment!",
            statusCode: 404,
        };

    await ReviewSchema.findByIdAndDelete(reviewId);
    await ReviewSchema.calculateAverageRatings(review.product);

    return {
        type: "Success",
        message: "Delete review successfully!",
        statusCode: 200,
    };
};

exports.getReviewById = async (productId, reviewId) => {
    const review = await ReviewSchema.findOne({
        _id: reviewId,
        product: productId,
    });

    if (!review)
        return {
            type: "Error",
            message: "Review not found!",
            statusCode: 404,
        };

    return {
        type: "Success",
        message: "Get review successfully!",
        statusCode: 200,
        review,
    };
};

exports.getAllReviews = async (req) => {
    const product = await ProductSchema.findById(req.params.productId);

    if (!product)
        return {
            type: "Error",
            message: "Product not found!",
            statusCode: 404,
        };

    let reviews = await apiFeature(req, ReviewSchema);

    if (reviews.length === 0)
        return {
            type: "Error",
            message: "No review found!",
            statusCode: 404,
        };

    reviews = reviews.filter(
        (review) =>
            review.product.toString() === req.params.productId.toString()
    );

    return {
        type: "Success",
        message: "Reviews found!",
        statusCode: 200,
        reviews,
    };
};
