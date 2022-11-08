const mongoose = require('mongoose');

const SizeSchema = new mongoose.Schema(
    {
        product: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            }
        ],
        size: {
            type: String,
            lowercase: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

SizeSchema.index({ size: 1 }, { unique: true });

module.exports = mongoose.model('Size', SizeSchema, 'sizes');