const mongoose = require('mongoose')

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
            default: '/uploads/default.jpeg'
        },
        category: {
            type: String,
            required: [true, 'Please provide product category'],
            enum: {
                values: [],
                message: '{VALUE} is not supported'
            }
        },
        company: {
            type: String,
            required: [true, 'Please provide product company'],
            enum: {
                values: [],
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
    { timestamps: true }
)

module.exports = mongoose.model('Product', ProductSchema)