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

ReviewSchema.statics.calculateAvgRatingAndCountNumReviews = async function (productId) {
    const result = await this.aggregate([
        { $match: { product: productId } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                numOfReviews: { $sum: 1 },
            },
        },
    ]);

    try {
        await this.model('Product').findOneAndUpdate(
            { _id: productId },
            {
                averageRating: Math.ceil(result[0]?.averageRating || 0),
                numberOfReviews: result[0]?.numOfReviews || 0,
            }
        );
    } catch (error) {
        console.log(error);
    }
}

ReviewSchema.post('save', async function () {
    await this.constructor.calculateAvgRatingAndCountNumReviews(this.product)
})

ReviewSchema.post('findOneAndDelete', async function (doc) {
    await doc.constructor.calculateAvgRatingAndCountNumReviews(doc.product)
})

module.exports = mongoose.model('Review', ReviewSchema)