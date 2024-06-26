const mongoose = require('mongoose');
const Review = require('./Review');

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, 'Please provide product name'],
            maxlength: [120, 'Product name cannot be more than 120 characters']
        },
        price: {
            type: Number,
            required: [true, 'Please provide product price'],
            default: 0
        },
        description: {
            type: String,
            required: [true, 'Please provide product description'],
            maxlength: [1200, 'Product description cannot be more than 1200 characters']
        },
        image: {
            type: String,
            default: '/uploads/default.jpg'
        },
        category: {
            type: String,
            required: [true, 'Please provide product category'],
            enum: {
                values: ['tents', 'gear', 'sleeping', 'glamping', 'furniture'],
                message: '{VALUE} is not supported'
            }
        },
        company: {
            type: String,
            required: [true, 'Please provide product company'],
            enum: {
                values: ['naturehike', 'nemo', 'marmot', 'msr'],
                message: '{VALUE} is not supported'
            }
        },
        colors: {
            type: [String],
            required: true,
            default: ['#fff']
        },
        featured: {
            type: Boolean,
            default: false
        },
        freeShipping: {
            type: Boolean,
            default: false
        },
        inventory: {
            type: Number,
            required: true,
            default: 42
        },
        averageRating: {
            type: Number,
            default: 0
        },
        numberOfReviews: {
            type: Number,
            default: 0
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

ProductSchema.pre('deleteOne', async function () {
    const { _conditions: { _id: productId } } = this
    await Review.deleteMany({ product: productId })
});

ProductSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'product',
    justOne: false
})



module.exports = mongoose.model('Product', ProductSchema)