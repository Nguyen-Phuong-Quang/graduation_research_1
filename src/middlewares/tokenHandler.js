const jwt = require('jsonwebtoken');
const moment = require('moment');

const TokenSchema = require('../models/TokenSchema');
const config = require('../config/config');
const tokenTypes = require('../config/token');

// Genarate token
const generateToken = (userId, expires, type) => {
    const payload = {
        userId,
        iat: moment().unix(),
        exp: expires.unix(),
        type
    }
    return jwt.sign(payload, config.jwt.jwt_secret)
}
// Save token
const saveToken = async (userId, token, expires, type) => {
    const newTokenSchema = await TokenSchema.create({
        token,
        userId,
        expires: Date.parse(expires),
        type
    })

    return newTokenSchema;
}

// Verify token
exports.verifyToken = async (token, type) => {
    const payload = jwt.verify(token, config.jwt.jwt_secret);

    const tokenResponse = await TokenSchema.findOne({ token, userId: payload.userId, type });

    if (!tokenResponse)
        return {
            type: 'Error',
            message: 'Token not found!',
            statusCode: 404
        }

    return tokenResponse;
}

// Generate auth token
exports.generateAuthToken = async (user) => {

    const accessTokenExpires = moment().add(
        config.jwt.jwt_access_expiration_minutes,
        'minutes'
    )

    const accessToken = generateToken(user._id, accessTokenExpires, tokenTypes.access);

    const refreshTokenExpires = moment().add(
        config.jwt.jwt_refresh_expiration_days,
        'days'
    )

    const refreshToken = generateToken(user._id, refreshTokenExpires, tokenTypes.refresh);

    await saveToken(user._id, refreshToken, refreshTokenExpires, tokenTypes.refresh);

    return {
        accessToken,
        refreshToken
    };

}





