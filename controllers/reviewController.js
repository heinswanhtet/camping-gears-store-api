const Review = require('../models/Review')
const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')

const createReview = async (req, res) => {
    const { product: productId, rating, title, comment } = req.body

    if (!productId || !rating || !title || !comment)
        throw new CustomError.BadRequestError('Please enter all required values')

    const productExist = await Product.findOne({ _id: productId })
    if (!productExist)
        throw new CustomError.NotFoundError(`No product with id: ${productId}`)

    const alreadyReviewed = await Review.findOne({ product: productId, user: req.user.userId })
    if (alreadyReviewed)
        throw new CustomError.BadRequestError('Sorry, already submitted review for this product')

    req.body.user = req.user.userId
    const review = await Review.create(req.body)

    res.status(StatusCodes.CREATED).json({ review })
}

const getAllReviews = async (req, res) => {
    const reviews = await Review.find({}).populate(
        [
            { path: 'user', select: 'name email role' },
            { path: 'product', select: 'name price category company' }
        ]
    )
    res.status(StatusCodes.OK).json({ reviews })
}

const getSingleReview = async (req, res) => {
    res.send('get single review')
}

const updateReview = async (req, res) => {
    res.send('update review')
}

const deleteReview = async (req, res) => {
    res.send('delete review')
}

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview
}