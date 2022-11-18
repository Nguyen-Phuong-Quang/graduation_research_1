const categoryService = require("../services/category.service");
const CustomErrorHandler = require("../utils/CustomErrorHandler");

exports.addCategory = async (req, res, next) => {
    const { name, description } = req.body;
    try {
        const { type, message, statusCode, category } =
            await categoryService.createCategory(name, description, req.file);

        if (type === "Error")
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            category,
        });
    } catch (err) {
        next(err);
    }
};

exports.getCategoryById = async (req, res, next) => {
    const { categoryId } = req.params;
    try {
        const { type, message, statusCode, category } =
            await categoryService.getCategoryById(categoryId);

        if (type === "Error")
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            category,
        });
    } catch (err) {
        next(err);
    }
};

exports.getCategories = async (req, res, next) => {
    try {
        if (!req.query.limit) req.query.limit = 10;

        const { type, message, statusCode, categories } =
            await categoryService.getCategoryByQuery(req);

        if (type === "Error")
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            categories,
        });
    } catch (err) {
        next(err);
    }
};

exports.updateCategoryDetail = async (req, res, next) => {
    try {
        const { type, message, statusCode, category } =
            await categoryService.updateCategoryDetail(
                req.params.categoryId,
                req.body
            );

        if (type === "Error")
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            category,
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        const { type, message, statusCode } =
            await categoryService.deleteCategory(req.params.categoryId);

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

exports.updateCategoryImage = async (req, res, next) => {
    try {
        const { type, message, statusCode, category } =
            await categoryService.updateCategoryImage(
                req.params.categoryId,
                req.file
            );
            
        if (type === "Error")
            return next(new CustomErrorHandler(statusCode, message));

        res.status(statusCode).json({
            type,
            message,
            category,
        });
    } catch (err) {
        next(err);
    }
};
