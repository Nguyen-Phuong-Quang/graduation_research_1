const CartSchema = require('../models/CartSchema');
const ColorSchema = require('../models/ColorSchema');
const SizeSchema = require('../models/SizeSchema');
const ProductSchema = require('../models/ProductSchema');

exports.addItemToCart = async (email, productId, quantity, color, size) => {

    if (quantity <= 0)
        return {
            type: 'Error',
            message: 'Quantity must be greater than zero!',
            statusCode: 400
        }

    const product = await ProductSchema.findById(productId);

    if (!product)
        return {
            type: 'Error',
            message: 'No product found!',
            statusCode: 404
        }

    const { price } = product;

    const cart = await CartSchema.findOne({ email });

    const colorCheck = product.colors.find(cl => cl.color.toString() === color.toString());
    if (!colorCheck)
        return {
            type: 'Error',
            message: 'This product does not have this color!',
            statusCode: 400
        }

    const sizeCheck = product.sizes.find(sz => sz.size.toString() === size.toString());
    if (!sizeCheck)
        return {
            type: 'Error',
            message: 'This product does not have this size!',
            statusCode: 400
        }

    // If no cart existed
    if (!cart) {
        const cartData = {
            email,
            items: [
                {
                    product: productId,
                    color: colorCheck._id,
                    size: sizeCheck._id,
                    totalProductQuantity: quantity,
                    totalProductPrice: price * quantity
                }
            ]
        }

        const newCart = await CartSchema.create(cartData);

        return {
            type: 'Success',
            message: 'Create new cart and add item successfully!',
            statusCode: 200,
            cart: newCart
        }
    }

    const indexFound = cart.items.findIndex(
        item =>
            item.product._id.toString() === productId.toString() &&
            item.color._id.toString() === colorCheck._id.toString() &&
            item.size._id.toString() === sizeCheck._id.toString()
    )

    // If this product not exist in this cart
    if (indexFound !== -1) {
        cart.items[indexFound].totalProductQuantity += quantity;
        cart.items[indexFound].totalProductPrice += price * quantity;
    }
    else {
        cart.items.push({
            product: productId,
            color: colorCheck._id,
            size: sizeCheck._id,
            totalProductQuantity: quantity,
            totalProductPrice: price * quantity
        });
    }

    await cart.save();

    return {
        type: 'Success',
        message: 'Add item to cart successfully!',
        statusCode: 200,
        cart
    }
}

exports.getCart = async (email) => {
    const cart = await CartSchema.findOne({ email });

    if (!cart)
        return {
            type: 'Error',
            message: 'No cart found!',
            statusCode: 404
        }

    return {
        type: 'Success',
        message: 'Cart found!',
        statusCode: 200,
        cart
    }
}

exports.deleteCart = async (email) => {
    const { deletedCount } = await CartSchema.deleteOne({ email });

    if (deletedCount === 0)
        return {
            type: 'Error',
            message: 'No cart found!',
            statusCode: 404
        }

    return {
        type: 'Error',
        message: 'Delete cart successfully!',
        statusCode: 200
    }
}

exports.deleteItem = async (email, productId, color, size) => {
    const cart = await CartSchema.findOne({ email });

    if (!cart)
        return {
            type: 'Error',
            message: 'No cart found!',
            statusCode: 404
        }

    const colorDoc = await ColorSchema.isExisted(productId, color);

    if (!colorDoc)
        return {
            type: 'Error',
            message: 'This color does not exist!',
            statusCode: 404
        }

    const sizeDoc = await SizeSchema.isExisted(productId, size);

    if (!sizeDoc)
        return {
            type: 'Error',
            message: 'This size does not exist!',
            statusCode: 404
        }

    const product = cart.items.find((item) => {
        return item.product._id.toString() === productId.toString()
            && item.color.color.toString() === color.toString()
            && item.size.size.toString() === size.toString();
    })

    if (!product)
        return {
            type: 'Error',
            message: 'This product does not exist in your cart!',
            statusCode: 404
        }


    const newCart = await cart.updateOne({
        $pull: {
            items: {
                product: productId,
                color: colorDoc._id,
                size: sizeDoc._id
            }
        },
        totalQuantity: cart.totalQuantity - product.totalProductQuantity,
        totalPrice: cart.totalPrice - product.totalProductPrice
    });

    return {
        type: 'Success',
        message: 'Remove item successfully!',
        statusCode: 200,
        cart: newCart
    }
}