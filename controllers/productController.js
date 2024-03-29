const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const cloudinary = require('cloudinary').v2
const { unlink } = require('fs').promises

const createProduct = async (req, res) => {
    req.body.user = req.user.userId
    // checking image property whether or not it is null or empty if it is in body
    // assign as undefined to trigger default value in mongo db if it is null or empty
    req.body.image = req.body.image || undefined
    const product = await Product.create(req.body)
    res.status(StatusCodes.CREATED).json({ product })
}

const getAllProducts = async (req, res) => {
    const products = await Product.find({}).populate({ path: 'user', select: 'name email' })
    res.status(StatusCodes.OK).json({ total: products.length, products })
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
    const productImage = req.files.image
    const result = await cloudinary.uploader.upload(
        productImage.tempFilePath,
        {
            use_filename: true,
            folder: 'camping-gears-store-api'
        }
    )
    await unlink(productImage.tempFilePath)
    res.status(StatusCodes.OK).json({ image: { src: result.secure_url } })
}

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage
}