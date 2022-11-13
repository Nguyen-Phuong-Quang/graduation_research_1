const CartSchema = require('../models/CartSchema');
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