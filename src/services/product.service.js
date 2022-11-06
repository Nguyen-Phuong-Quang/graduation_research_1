const ProductSchema = require("../models/ProductSchema");
const { uploadFileCloudinary } = require("../utils/cloudinary");

exports.createProduct = async (body, files, seller) => {
    const {
        name,
        category,
        price,
        description,
        colors,
        sizes,
        quantity,
        sold,
        isOutOfStock
    } = body;

    const mainImage = files.find(image => image.fieldname === 'mainImage');
    const images = files.filter(image => image.fieldname !== 'mainImage');

    if (!name || !price || !colors || !sizes || !quantity || mainImage.length === 0 || images.length === 0)
        return {
            type: 'Error',
            message: 'Missing field!',
            statusCode: 400
        }

    const folderName = `Products/${name.trim().split(' ').join('-')}`;

    const imagesPromises = images.map(image => uploadFileCloudinary(image.buffer, folderName));

    const imagesResult = await Promise.all(imagesPromises);

    const mainImageResult = await uploadFileCloudinary(mainImage.buffer, folderName);

    const imagesSecureUrl = [];
    const imagesPublicId = [];

    imagesResult.forEach(image => {
        imagesSecureUrl.push(image.secure_url);
        imagesPublicId.push(image.public_id);
    })

    const newProduct = await ProductSchema.create({
        name,
        category,
        price,
        description,
        colors,
        sizes,
        quantity,
        sold,
        isOutOfStock,
        images: imagesSecureUrl,
        imagesId: imagesPublicId,
        seller,
        mainImage: mainImageResult.secure_url,
        mainImageId: mainImageResult.public_id
    })

    return {
        type: 'Success',
        message: 'Add product successfully!',
        statusCode: 200,
        product: newProduct
    }
}

exports.updateProductDetail = async (productId, sellerId, body) => {
    const product = await ProductSchema.findById(productId);

    if (!product)
        return {
            type: 'Error',
            message: 'No product found!',
            statusCode: 404
        }

    if (sellerId.toString() !== product.seller.toString())
        return {
            type: 'Error',
            message: 'This is not your product!',
            statusCode: 403
        }

    const newProduct = await ProductSchema.findByIdAndUpdate(productId, body, {
        new: true,
        runValidators: true
    })

    return {
        type: 'Success',
        message: 'Update product successfully!',
        statusCode: 200,
        product: newProduct
    }
}