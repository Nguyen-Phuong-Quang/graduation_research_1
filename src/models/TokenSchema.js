const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema(
    {
        token: { type: String, required: true },
        userId: { type: mongoose.Types.ObjectId, ref: "users" },
        expires: { type: Date, required: true },
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Token', TokenSchema, 'tokens');