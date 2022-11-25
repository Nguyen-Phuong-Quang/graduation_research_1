const moment = require("moment");
const OrderSchema = require("../models/OrderSchema");
const CartSchema = require("../models/CartSchema");
const ProductSchema = require("../models/ProductSchema");
const DiscountSchema = require("../models/DiscountSchema");
const apiFeatures = require("../utils/apiFeatures");
const orderStatus = require("../constants/oderStatus");

exports.createOrder = async (body, user) => {
    const { shippingAddress, paymentMethod, phone, discountCode } = body;
    const { address, city, postalCode, country } = shippingAddress;

    if (
        !paymentMethod ||
        !phone ||
        !address ||
        !city ||
        !postalCode ||
        !country
    )
        return {
            type: "Error",
            message: "Missing field!",
            statusCode: 400,
        };

    const cart = await CartSchema.findOne({ email: user.email });

    if (!cart || cart.items.length === 0)
        return {
            type: "Error",
            message: "No cart found!",
            statusCode: 404,
        };

    let finalPrice = cart.totalPrice;

    if (discountCode) {
        // Check discount code exist
        const discount = await DiscountSchema.findOne({ code: discountCode });

        if (!discount)
            return {
                type: "Error",
                message: "No discount code found!",
                statusCode: 404,
            };

        // Handle discount code
        if (!user.discountCodes.includes(discountCode))
            return {
                type: "Error",
                message: "Not your discount code!",
                statusCode: 400,
            };

        // Check valid day
        if (moment().unix() > discount.validUntil)
            return {
                type: "Error",
                message: "Discount code is expired!",
                statusCode: 400,
            };

        if (cart.totalPrice > discount.minOrderValue) {
            // Check price unit
            if (discount.discountUnit === "percent") {
                // Check value to reduce amount
                const reducedAmount =
                    (cart.totalPrice * discount.discountValue) / 100;

                if (reducedAmount > discount.maxDiscountAmount) {
                    finalPrice -= discount.maxDiscountAmount;
                } else {
                    finalPrice -= reducedAmount;
                }
            } else {
                finalPrice -= discount.discountValue;
            }
        }
    }

    const orderDetail = {
        products: cart.items,
        user: user._id,
        orderPrice: finalPrice,
        isPaid: true,
        paidAt: moment(),
        shippingAddress,
        phone,
        paymentMethod,
    };

    const order = await OrderSchema.create(orderDetail);

    for (const item of cart.items) {
        const id = item.product;
        const { totalProductQuantity } = item;
        const product = await ProductSchema.findById(id);
        product.sold += totalProductQuantity;
        product.quantity -= totalProductQuantity;
        await product.save();
    }

    await CartSchema.findByIdAndDelete(cart._id);

    return {
        type: "Success",
        message: "Order is being processed!",
        statusCode: 200,
        order,
    };
};

exports.getOrdersByQuery = async (req) => {
    req.query.user = req.user._id;

    const orders = await apiFeatures(req, OrderSchema);

    if (!orders || orders.length === 0)
        return {
            type: "Error",
            message: "No order found!",
            statusCode: 404,
        };

    return {
        type: "Success",
        message: "Order found!",
        statusCode: 200,
        orders,
    };
};

exports.getOrderById = async (orderId) => {
    const order = await OrderSchema.findById(orderId);

    if (!order)
        return {
            type: "Error",
            message: "No order found!",
            statusCode: 404,
        };

    return {
        type: "Success",
        message: "Order found!",
        statusCode: 200,
        order,
    };
};

exports.cancelOrder = async (orderId) => {
    const order = await OrderSchema.findById(orderId);

    if (!order)
        return {
            type: "Error",
            message: "No order found!",
            statusCode: 404,
        };

    for (const item of order.products) {
        const product = await ProductSchema.findById(item.product);

        if (!product)
            return {
                type: "Error",
                message: "No product found!",
                statusCode: 404,
            };

        product.quantity += item.totalProductQuantity;
        product.sold -= item.totalProductQuantity;

        await product.save();
    }

    await OrderSchema.findByIdAndDelete(orderId);

    return {
        type: "Success",
        message: "Cancel order successfully!",
        statusCode: 200,
    };
};

exports.updateOrderStatus = async (status, orderId) => {
    if (!status)
        return {
            type: "Error",
            message: "Status field required!",
            statusCode: 400,
        };

    if (!orderStatus.includes(status))
        return {
            type: "Error",
            message: "No status found in enum!",
            statusCode: 400,
        };

    const order = await OrderSchema.findById(orderId);

    if (!order)
        return {
            type: "Error",
            message: "No order found!",
            statusCode: 404,
        };

    if (status === "Cancelled") {
        const response = await this.cancelOrder(orderId);

        if (response.type === "Error") {
            return response;
        }

        return {
            type: "Success",
            message: "Cancel order successfully!",
            statusCode: 200,
        };
    }

    order.status = status;

    await order.save();

    return {
        type: "Success",
        message: "Update order status successfully!",
        statusCode: 200,
    };
};
