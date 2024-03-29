const Review = require('../models/Review')
const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { checkPermissions } = require('../utils')

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
    const { id: reviewId } = req.params

    const review = await Review.findOne({ _id: reviewId }).populate(
        [
            { path: 'user', select: 'name email role' },
            { path: 'product', select: 'name price category company' }
        ]
    )
    if (!review)
        throw new CustomError.NotFoundError(`No review with id: ${reviewId}`)

    res.status(StatusCodes.OK).json({ review })
}

const updateReview = async (req, res) => {
    const { id: reviewId } = req.params
    const { rating, title, comment } = req.body

    const review = await Review.findOne({ _id: reviewId })
    if (!review)
        throw new CustomError.NotFoundError(`No review with id: ${reviewId}`)

    checkPermissions({ requestUser: req.user, resourceUserId: review.user })

    review.rating = rating
    review.title = title
    review.comment = comment

    await review.save()

    res.status(StatusCodes.OK).json({ review })
}

const deleteReview = async (req, res) => {
    const { id: reviewId } = req.params

    const review = await Review.findOne({ _id: reviewId })
    if (!review)
        throw new CustomError.NotFoundError(`No review with id: ${reviewId}`)

    checkPermissions({ requestUser: req.user, resourceUserId: review.user })

    await review.deleteOne()

    res.status(StatusCodes.OK).json({ msg: 'Success! Review removed' })
}

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview
}