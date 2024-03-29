const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema(
    {
        rating: {
            type: Number,
            required: [true, 'Please provide rating'],
            min: 1,
            max: 5
        },
        title: {
            type: String,
            required: [true, 'Please provide rating title'],
            maxlength: 120
        },
        comment: {
            type: String,
            required: [true, 'Please provide rating text'],
        },
        product: {
            type: mongoose.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
)

// make sure a user can only comment about a product once
ReviewSchema.index({ product: 1, user: 1 }, { unique: true })

module.exports = mongoose.model('Review', ReviewSchema)