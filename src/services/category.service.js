const CategorySchema = require("../models/CategorySchema");
const apiFeatures = require("../utils/apiFeatures");
const {
    uploadFileCloudinary,
    destroyFileCloudinary,
} = require("../utils/cloudinary");

exports.createCategory = async (name, description, imageFile) => {
    if (!name || !description || !imageFile)
        return {
            type: "Error",
            message: "Missing field!",
            statusCode: 400,
        };

    const folderName = `Categories/${name.trim().split(" ").join("-")}`;

    const imageUploadResponse = await uploadFileCloudinary(
        imageFile.buffer,
        folderName
    );

    const category = await CategorySchema.create({
        name,
        description,
        image: imageUploadResponse.secure_url,
        imageId: imageUploadResponse.public_id,
    });

    return {
        type: "Success",
        message: "Create category successfully!",
        statusCode: 200,
        category,
    };
};

exports.getCategoryById = async (categoryId) => {
    const category = await CategorySchema.findById(categoryId);

    if (!category)
        return {
            type: "Error",
            message: "No category found!",
            statusCode: 404,
        };

    return {
        type: "Success",
        message: "Category found!",
        statusCode: 200,
        category,
    };
};

exports.getCategoryByQuery = async (req) => {
    const categories = await apiFeatures(req, CategorySchema);

    if (categories.length === 0)
        return {
            type: "Error",
            message: "No category found!",
            statusCode: 404,
        };

    return {
        type: "Success",
        message: "Category found!",
        statusCode: 200,
        categories,
    };
};

exports.updateCategoryDetail = async (categoryId, body) => {
    let category = await CategorySchema.findById(categoryId);

    if (!category)
        return {
            type: "Error",
            message: "No category found!",
            statusCode: 404,
        };

    category = await CategorySchema.findByIdAndUpdate(categoryId, body, {
        new: true,
        runValidators: true,
    });

    return {
        type: "Success",
        message: "Update category successfully!",
        statusCode: 200,
        category,
    };
};

exports.updateCategoryImage = async (categoryId, imageFile) => {
    if (imageFile === undefined)
        return {
            type: "Error",
            message: "Image required!",
            statusCode: 400,
        };

    let category = await CategorySchema.findById(categoryId);

    if (!category)
        return {
            type: "Error",
            message: "No category found!",
            statusCode: 404,
        };

    await destroyFileCloudinary(category.imageId);

    const folderName = `Categories/${category.name
        .trim()
        .split(" ")
        .join("-")}`;

    const imageUploadResponse = await uploadFileCloudinary(
        imageFile.buffer,
        folderName
    );

    category = await CategorySchema.findByIdAndUpdate(
        categoryId,
        {
            image: imageUploadResponse.secure_url,
            imageId: imageUploadResponse.public_id,
        },
        { new: true, runValidators: true }
    );

    return {
        type: "Success",
        message: "Update category successfully!",
        statusCode: 200,
        category,
    };
};

exports.deleteCategory = async (categoryId) => {
    let category = await CategorySchema.findById(categoryId);

    if (!category)
        return {
            type: "Error",
            message: "No category found!",
            statusCode: 404,
        };

    await destroyFileCloudinary(category.imageId);

    await CategorySchema.findByIdAndDelete(categoryId);

    return {
        type: "Success",
        message: "Delete category successfully!",
        statusCode: 200,
    };
};
