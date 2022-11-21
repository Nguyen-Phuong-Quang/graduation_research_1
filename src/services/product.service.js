const ProductSchema = require("../models/ProductSchema");
const ColorSchema = require("../models/ColorSchema");
const SizeSchema = require("../models/SizeSchema");
const {
    uploadFileCloudinary,
    destroyFileCloudinary,
} = require("../utils/cloudinary");
const apiFeatures = require("../utils/apiFeatures");

exports.getProductById = async (productId) => {
    const product = await ProductSchema.findById(productId).lean();

    if (!product)
        return {
            type: "Error",
            message: "No product found!",
            statusCode: 404,
        };

    return {
        type: "Success",
        message: "Found!",
        statusCode: 200,
        product,
    };
};

exports.getAllProductsByQuery = async (req) => {
    const { limit, min, max } = req.query;

    if (!limit) req.query.limit = 20;

    if (min || max) {
        const priceSearch = {};
        if (min) priceSearch.$gte = min * 1;
        if (max) priceSearch.$lte = max * 1;
        req.query.priceAfterDiscount = priceSearch;
    }

    const products = await apiFeatures(req, ProductSchema);

    if (products.length < 1)
        return {
            type: "Error",
            message: "No product found!",
            statusCode: 404,
        };

    return {
        type: "Success",
        message: "Found!",
        statusCode: 200,
        products,
    };
};

exports.createProduct = async (body, files, seller) => {
    const {
        name,
        category,
        price,
        priceAfterDiscount,
        description,
        colors,
        sizes,
        quantity,
        sold,
        isOutOfStock,
    } = body;

    const mainImage = files.find((image) => image.fieldname === "mainImage");
    const images = files.filter((image) => image.fieldname === "images");

    if (
        !name ||
        !price ||
        !colors ||
        !sizes ||
        !quantity ||
        mainImage.length === 0 ||
        images.length === 0
    )
        return {
            type: "Error",
            message: "Missing field!",
            statusCode: 400,
        };

    const folderName = `Products/${name.trim().split(" ").join("-")}`;

    const imagesPromises = images.map((image) =>
        uploadFileCloudinary(image.buffer, folderName)
    );

    const imagesResult = await Promise.all(imagesPromises);

    const mainImageResult = await uploadFileCloudinary(
        mainImage.buffer,
        folderName
    );

    const imagesSecureUrl = [];
    const imagesPublicId = [];

    imagesResult.forEach((image) => {
        imagesSecureUrl.push(image.secure_url);
        imagesPublicId.push(image.public_id);
    });

    const newProduct = await ProductSchema.create({
        name,
        category,
        price,
        priceAfterDiscount,
        description,
        quantity,
        sold,
        isOutOfStock,
        images: imagesSecureUrl,
        imagesId: imagesPublicId,
        seller,
        mainImage: mainImageResult.secure_url,
        mainImageId: mainImageResult.public_id,
    });

    const colorsArray = colors.split(",").map((color) => color.trim());
    const sizesArray = sizes.split(",").map((size) => size.trim());

    const colorsId = [];
    const sizesId = [];

    await Promise.all(
        colorsArray.map(async (color) => {
            const colorDocument = await ColorSchema.findOne({ color });

            if (!colorDocument) {
                const newColor = await ColorSchema.create({
                    product: newProduct._id,
                    color,
                });
                colorsId.push(newColor._id);
            } else {
                colorsId.push(colorDocument._id);
                colorDocument.product.push(newProduct._id);
                await colorDocument.save();
            }
        })
    );

    await Promise.all(
        sizesArray.map(async (size) => {
            const sizeDocument = await SizeSchema.findOne({ size });

            if (!sizeDocument) {
                const newSize = await SizeSchema.create({
                    product: newProduct._id,
                    size,
                });
                sizesId.push(newSize._id);
            } else {
                sizesId.push(sizeDocument._id);
                sizeDocument.product.push(newProduct._id);
                await sizeDocument.save();
            }
        })
    );

    newProduct.colors = colorsId;
    newProduct.sizes = sizesId;

    await newProduct.save();

    return {
        type: "Success",
        message: "Add product successfully!",
        statusCode: 200,
        product: newProduct,
    };
};

exports.updateProductDetail = async (productId, sellerId, body) => {
    const product = await ProductSchema.findById(productId);

    if (!product)
        return {
            type: "Error",
            message: "No product found!",
            statusCode: 404,
        };

    if (sellerId.toString() !== product.seller.toString())
        return {
            type: "Error",
            message: "This is not your product!",
            statusCode: 403,
        };

    const newProduct = await ProductSchema.findByIdAndUpdate(productId, body, {
        new: true,
        runValidators: true,
    });

    return {
        type: "Success",
        message: "Update product detail successfully!",
        statusCode: 200,
        product: newProduct,
    };
};

exports.updateProductImages = async (productId, sellerId, images) => {
    if (images.length === 0)
        return {
            type: "Error",
            message: "Select images!",
            statusCode: 400,
        };

    const product = await ProductSchema.findById(productId);

    if (!product)
        return {
            type: "Error",
            message: "No product found!",
            statusCode: 404,
        };

    if (sellerId.toString() !== product.seller.toString())
        return {
            type: "Error",
            message: "This is not your product!",
            statusCode: 403,
        };

    const mainImage = images.find((image) => image.fieldname === "mainImage");
    const otherImages = images.filter((image) => image.fieldname === "images");

    const folderName = `Products/${product.name.trim().split(" ").join("-")}`;

    const newProductBody = {};

    if (mainImage) {
        await destroyFileCloudinary(product.mainImageId);
        const mainImageResult = await uploadFileCloudinary(
            mainImage.buffer,
            folderName
        );

        newProductBody.mainImage = mainImageResult.secure_url;
        newProductBody.mainImageId = mainImageResult.public_id;
    }

    if (otherImages.length > 0) {
        product.imagesId.forEach((image) => destroyFileCloudinary(image));

        const imagesPromises = otherImages.map((image) =>
            uploadFileCloudinary(image.buffer, folderName)
        );
        const imagesResult = await Promise.all(imagesPromises);

        const imagesSecureUrl = [];
        const imagesPublicId = [];

        imagesResult.forEach((image) => {
            imagesSecureUrl.push(image.secure_url);
            imagesPublicId.push(image.public_id);
        });

        newProductBody.images = imagesSecureUrl;
        newProductBody.imagesId = imagesPublicId;
    }

    await ProductSchema.findByIdAndUpdate(productId, newProductBody, {
        new: true,
        runValidators: true,
    });

    return {
        type: "Success",
        message: "Update image successfully!",
        statusCode: 200,
    };
};

exports.deleteProductById = async (productId, sellerId) => {
    const product = await ProductSchema.findById(productId);

    if (!product)
        return {
            type: "Error",
            message: "No product found!",
            statusCode: 404,
        };

    if (sellerId.toString() !== product.seller.toString())
        return {
            type: "Error",
            message: "This is not your product!",
            statusCode: 403,
        };

    await destroyFileCloudinary(product.mainImageId);

    product.imagesId.forEach((image) => destroyFileCloudinary(image));

    await Promise.all(
        product.colors.map(async (color) => {
            await ColorSchema.updateOne(
                { _id: color },
                { $pull: { product: product._id } }
            );
        })
    );

    await Promise.all(
        product.sizes.map(async (size) => {
            await SizeSchema.updateOne(
                { _id: size },
                { $pull: { product: product._id } }
            );
        })
    );

    await ProductSchema.findByIdAndDelete(productId);

    return {
        type: "Success",
        message: "Delete product successfully!",
        statusCode: 200,
    };
};

exports.addColor = async (productId, seller, color) => {
    const product = await ProductSchema.findById(productId);

    if (!product)
        return {
            type: "Error",
            message: "No product found!",
            statusCode: 404,
        };

    if (seller.toString() !== product.seller.toString())
        return {
            type: "Error",
            message: "This is not your product!",
            statusCode: 403,
        };

    if (await ColorSchema.isExisted(productId, color.toLowerCase()))
        return {
            type: "Error",
            message: "Color exists!",
            statusCode: 401,
        };

    const newColor = await ColorSchema.create({ product: productId, color });

    product.colors.push(newColor._id);

    await product.save();

    return {
        type: "Success",
        message: "Add color successfully!",
        statusCode: 200,
        color: newColor,
    };
};

exports.deleteColor = async (productId, seller, color) => {
    const product = await ProductSchema.findById(productId);

    if (!product)
        return {
            type: "Error",
            message: "No product found!",
            statusCode: 404,
        };

    if (seller.toString() !== product.seller.toString())
        return {
            type: "Error",
            message: "This is not your product!",
            statusCode: 403,
        };

    const colorDoc = await ColorSchema.isExisted(productId, color);
    if (!colorDoc)
        return {
            type: "Error",
            message: "No color found!",
            statusCode: 404,
        };

    product.colors = product.colors.filter(
        (colorId) => colorId.toString() !== colorDoc._id.toString()
    );

    await ColorSchema.updateOne({ color }, { $pull: { product: product._id } });

    await product.save();

    return {
        type: "Success",
        message: "Delete color successfully!",
        statusCode: 200,
    };
};

exports.addSize = async (productId, seller, size) => {
    const product = await ProductSchema.findById(productId);

    if (!product)
        return {
            type: "Error",
            message: "No product found!",
            statusCode: 404,
        };

    if (seller.toString() !== product.seller.toString())
        return {
            type: "Error",
            message: "This is not your product!",
            statusCode: 403,
        };

    if (await SizeSchema.isExisted(productId, size.toLowerCase()))
        return {
            type: "Error",
            message: "Size exists!",
            statusCode: 401,
        };

    const newSize = await SizeSchema.create({ product: productId, size });

    product.sizes.push(newSize._id);

    await product.save();

    return {
        type: "Success",
        message: "Add size successfully!",
        statusCode: 200,
        size: newSize,
    };
};

exports.deleteSize = async (productId, seller, size) => {
    const product = await ProductSchema.findById(productId);

    if (!product)
        return {
            type: "Error",
            message: "No product found!",
            statusCode: 404,
        };

    if (seller.toString() !== product.seller.toString())
        return {
            type: "Error",
            message: "This is not your product!",
            statusCode: 403,
        };

    const sizeDoc = await SizeSchema.isExisted(productId, size);
    if (!sizeDoc)
        return {
            type: "Error",
            message: "No size found!",
            statusCode: 404,
        };

    product.sizes = product.sizes.filter(
        (sizeId) => sizeId.toString() !== sizeDoc._id.toString()
    );

    await SizeSchema.updateOne({ size }, { $pull: { product: product._id } });

    await product.save();

    return {
        type: "Success",
        message: "Delete cosizelor successfully!",
        statusCode: 200,
    };
};
