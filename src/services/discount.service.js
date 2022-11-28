const moment = require("moment");
const DiscountSchema = require("../models/DiscountSchema");
const UserSchema = require("../models/UserSchema");
const apiFeatures = require("../utils/apiFeatures");

/**
 * @desc    Get all discount codes
 * @param   { object } req - Request object
 * @returns { object<type|message|statusCode|discounts> }
 */
exports.getAllDiscountCodes = async (req) => {
    const discounts = await apiFeatures(req, DiscountSchema);

    if (!discounts || discounts.length === 0)
        return {
            type: "Error",
            message: "No discount code found!",
            statusCode: 404,
        };

    return {
        type: "Success",
        message: "Discount codes found!",
        statusCode: 200,
        discounts,
    };
};

/**
 * @desc    Get Discount Code
 * @param   { Array } codes - Discount codes
 * @return  { object<type|message|statusCode|discounts> }
 */
exports.getDiscountCode = async (codes) => {
    const discounts = await DiscountSchema.find({ code: { $in: codes } });

    if (!discounts || discounts.length === 0)
        return {
            type: "Error",
            message: "No discount found!",
            statusCode: 404,
        };

    return {
        type: "Success",
        message: "Discount found!",
        statusCode: 200,
        discounts,
    };
};

/**
 * @desc    Verfiy discount code
 * @param   { String } discountCode - Discount code
 * @param   { object } user - User object data
 * @returns { object<type|message|statusCode> }
 */
exports.verifyDiscountCode = async (discountCode, user) => {
    if (!discountCode)
        return {
            type: "Error",
            message: "Missing discount code on url params",
            statusCode: 400,
        };

    if (user.discountCodes.includes(discountCode))
        return {
            type: "Error",
            message: "Just 1 code only!",
            statusCode: 400,
        };

    const discount = await DiscountSchema.findOne({ code: discountCode });

    if (!discount)
        return {
            type: "Error",
            message: "No discount found!",
            statusCode: 404,
        };

    discount.available -= 1;

    await discount.save();

    await UserSchema.findByIdAndUpdate(user._id, {
        $push: { discountCodes: discountCode },
    });

    return {
        type: "Success",
        message: "Success verify discount code!",
        statusCode: 200,
    };
};

/**
 * @desc    Generate Discount Code
 * @param   { object }  body - Request body data
 * @returns { object<type|message|statusCode|discount> }
 */
exports.generateDiscountCode = async (body) => {
    const {
        codeLength,
        available,
        discountValue,
        discountUnit,
        validUntil,
        minOrderValue,
        maxDiscountAmount,
    } = body;

    if (
        !codeLength ||
        !available ||
        !discountValue ||
        !discountUnit ||
        !validUntil ||
        !minOrderValue ||
        !maxDiscountAmount
    )
        return {
            type: "Error",
            message: "Missing field!",
            statusCode: 400,
        };

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let code = "";

    for (let i = 0; i < codeLength; ++i)
        code += characters[Math.floor(charactersLength * Math.random())];

    const discount = await DiscountSchema.create({
        code,
        discountValue,
        discountUnit,
        validUntil: moment(validUntil).unix(),
        available,
        minOrderValue,
        maxDiscountAmount,
    });

    return {
        type: "Success",
        message: "Create discount code successfully!",
        statusCode: 200,
        discount,
    };
};

/**
 * @desc    Delete Discount Code
 * @param   { String } discountId - ID of discount code
 * @return  { object<type|message|statusCode> }
 */
exports.deleteDiscountCode = async (discountId) => {
    const success = await DiscountSchema.findByIdAndDelete(discountId);

    if (!success)
        return {
            type: "Error",
            message: "No discount code found!",
            statusCode: 404,
        };

    await UserSchema.findByIdAndUpdate(user._id, {
        $pull: { discountCodes: success.code },
    });

    return {
        type: "Success",
        message: "Delete discount code successfully!",
        statusCode: 200,
    };
};

/**
 * @desc    Cancel Discount Code
 * @param   { String } discountCode - Discount code
 * @param   { String } userId - ID of user
 * @return  { object<type|message|statusCode> }
 */
exports.cancelDiscountCode = async (discountCode, user) => {
    const discount = await DiscountSchema.findOne({ code: discountCode });

    if (!discount)
        return {
            type: "Error",
            message: "No discount code found!",
            statusCode: 404,
        };

    if (!user.discountCodes.includes(discountCode))
        return {
            type: "Error",
            message: "This discount code not belonging to you!",
            statusCode: 400,
        };

    discount.available += 1;

    await discount.save();
    await UserSchema.findByIdAndUpdate(user._id, {
        $pull: { discountCodes: discountCode },
    });

    return {
        type: "Success",
        message: "Discount code cancelled!",
        statusCode: 200,
    };
};
