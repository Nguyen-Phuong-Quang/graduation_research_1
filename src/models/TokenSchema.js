const mongoose = require("mongoose");
const moment = require("moment");

const TokenSchema = new mongoose.Schema(
    {
        token: { type: String, required: true },
        userId: { type: mongoose.Types.ObjectId, ref: "users" },
        expires: { type: Date, required: true },
        type: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

TokenSchema.methods.isExpired = function (currentTime) {
    return moment(currentTime).unix() > moment(this.expires).unix();
};

module.exports = mongoose.model("Token", TokenSchema, "tokens");
