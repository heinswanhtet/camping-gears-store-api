const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')

const createProduct = async (req, res) => {
    req.body.user = req.user.userId
    const product = await Product.create(req.body)
    res.status(StatusCodes.CREATED).json({ product })
}

const getAllProducts = async (req, res) => {
    const products = await Product.find({}).populate({ path: 'user', select: 'name email' })
    res.status(StatusCodes.OK).json({ products })
}

const getSingleProduct = async (req, res) => {
    const { id: productId } = req.params

    const product = await Product.findOne({ _id: productId }).populate({ path: 'user', select: 'name email' })
    if (!product)
        throw new CustomError.NotFoundError(`No product with id: ${productId}`)

    res.status(StatusCodes.OK).json({ product })
}

const updateProduct = async (req, res) => {
    const { id: productId } = req.params

    const product = await Product.findOneAndUpdate(
        { _id: productId },
        req.body,
        {
            new: true,
            runValidators: true
        }
    ).populate({ path: 'user', select: 'name email' })
    if (!product)
        throw new CustomError.NotFoundError(`No product with id: ${productId}`)

    res.status(StatusCodes.OK).json({ product })

}

const deleteProduct = async (req, res) => {
    const { id: productId } = req.params

    const product = await Product.findOne({ _id: productId })
    if (!product)
        throw new CustomError.NotFoundError(`No product with id: ${productId}`)

    await product.deleteOne()

    res.status(StatusCodes.OK).json({ msg: 'Success! Product removed' })

}

const uploadImage = async (req, res) => {
    res.send('upload image')
}

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage
}