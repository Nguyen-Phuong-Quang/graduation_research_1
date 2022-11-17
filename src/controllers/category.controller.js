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
