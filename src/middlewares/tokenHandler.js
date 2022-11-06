const jwt = require('jsonwebtoken');
const moment = require('moment');

const TokenSchema = require('../models/TokenSchema');
const config = require('../config/config');
const tokenTypes = require('../config/token');

// Genarate token
const generateToken = (userId, email, expires, type) => {
    const payload = {
        userId,
        email,
        iat: moment().unix(),
        exp: expires.unix(),
        type
    }
    return jwt.sign(payload, config.jwt.jwt_secret)
}
// Save token
const saveToken = async (userId, token, expires) => {
    const newTokenSchema = await TokenSchema.create({
        token,
        userId,
        expires: Date.parse(expires),
    })

    return newTokenSchema;
}

// Verify token
exports.verifyToken = async (token) => {
    const payload = jwt.verify(token, config.jwt.jwt_secret);

    const tokenResponse = await TokenSchema.findOne({ token, userId: payload.userId });

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

    const refreshTokenExpires = moment().add(
        config.jwt.jwt_refresh_expiration_days,
        'days'
    )

    const token = generateToken(user._id, user.email, refreshTokenExpires, tokenTypes.refresh);
    
    await saveToken(user._id, token, refreshTokenExpires);

    return token;

}





