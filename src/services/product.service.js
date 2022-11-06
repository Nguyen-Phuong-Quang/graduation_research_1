const ProductSchema = require("../models/ProductSchema");
const { uploadFileCloudinary, destroyFileCloudinary } = require("../utils/cloudinary");

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
    const images = files.filter(image => image.fieldname === 'images');

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
        message: 'Update product detail successfully!',
        statusCode: 200,
        product: newProduct
    }
}

exports.updateProductImages = async (productId, sellerId, images) => {
    if (images.length === 0)
        return {
            type: 'Error',
            message: 'Select images!',
            statusCode: 400
        }


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

    const mainImage = images.find(image => image.fieldname === 'mainImage');
    const otherImages = images.filter(image => image.fieldname === 'images');

    const folderName = `Products/${product.name.trim().split(' ').join('-')}`;

    const newProductBody = {};

    if (mainImage) {
        await destroyFileCloudinary(product.mainImageId);
        const mainImageResult = await uploadFileCloudinary(mainImage.buffer, folderName);

        newProductBody.mainImage = mainImageResult.secure_url;
        newProductBody.mainImageId = mainImageResult.public_id;
    }

    if (otherImages.length > 0) {
        product.imagesId.forEach(image => destroyFileCloudinary(image))
        
        const imagesPromises = otherImages.map(image => uploadFileCloudinary(image.buffer, folderName));
        const imagesResult = await Promise.all(imagesPromises);

        const imagesSecureUrl = [];
        const imagesPublicId = [];

        imagesResult.forEach(image => {
            imagesSecureUrl.push(image.secure_url);
            imagesPublicId.push(image.public_id);
        })

        newProductBody.images = imagesSecureUrl;
        newProductBody.imagesId = imagesPublicId;
    }

    console.log(newProductBody);

    await ProductSchema.findByIdAndUpdate(productId, newProductBody, {
        new: true,
        runValidators: true
    })

    return {
        type: 'Success',
        message: 'Update image successfully!',
        statusCode: 200
    };
}