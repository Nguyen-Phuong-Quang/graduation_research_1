const FavouriteSchema = require("../models/FavouriteSchema");
const ProductSchema = require("../models/ProductSchema");

exports.addToFavourite = async (userId, productId) => {
    const product = await ProductSchema.findById(productId);

    if (!product)
        return {
            type: "Error",
            message: "No product found!",
            statusCode: 404,
        };

    const favourite = await FavouriteSchema.findOne({ user: userId });

    if (!favourite) {
        await FavouriteSchema.create({
            user: userId,
            products: [productId],
        });
    } else {
        if (favourite.products.includes(productId))
            return {
                type: "Error",
                message: "Product is existed in favourite list!",
                statusCode: 400,
            };

        favourite.products.push(productId);

        await favourite.save();
    }

    return {
        type: "Success",
        message: "Add product to favourite list successfully!",
        statusCode: 200,
    };
};

exports.deleteProductFromFavourite = async (userId, productId) => {
    const favourite = await FavouriteSchema.findOne({ user: userId });

    if (!favourite)
        return {
            type: "Error",
            message: "No favourite list found!",
            statusCode: 404,
        };

    if (!favourite.products.includes(productId))
        return {
            type: "Error",
            message: "This product is not in favourite list!",
            statusCode: 404,
        };

    await favourite.update({ $pull: { products: productId } });

    return {
        type: "Success",
        message: "Remove product from favourite list successfully!",
        statusCode: 200,
    };
};

exports.getFavouriteList = async (userId) => {
    const favourite = await FavouriteSchema.findOne({ user: userId });

    if (!favourite || favourite.products.length === 0)
        return {
            type: "Error",
            message: "Favourite list is empty!",
            statusCode: 404,
        };

    return {
        type: "Success",
        message: "Favourite list found!",
        statusCode: 200,
        favourite
    };
};

exports.checkProductInFavouriteList = async (userId, productId) => {
    const favourite = await FavouriteSchema.findOne({
        user: userId,
        products: productId,
    });

    if (!favourite)
        return {
            type: "Error",
            message: "No product in favourite list found!",
            statusCode: 404,
        };

    return {
        type: "Success",
        message: "Product in favourite list found!",
        statusCode: 200,
    };
};
