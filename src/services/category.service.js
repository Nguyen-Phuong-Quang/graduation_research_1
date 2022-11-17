const CategorySchema = require("../models/CategorySchema");
const { uploadFileCloudinary } = require("../utils/cloudinary");

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
