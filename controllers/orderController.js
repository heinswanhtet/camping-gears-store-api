const Order = require('../models/Order')
const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { checkPermissions } = require('../utils')

const StripeAPI = async ({ amount, currency }) => {
    const clientSecret = 'someRandomValue';
    return { clientSecret, amount };
}

const createOrder = async (req, res) => {
    const { tax, shippingFee, items: cartItems } = req.body

    if (!cartItems || cartItems.length < 1)
        throw new CustomError.BadRequestError('No cart items provided! Please provide them')
    if (!tax || !shippingFee)
        throw new CustomError.BadRequestError('Please provide tax and shipping fee values')

    let orderItems = []
    let subtotal = 0

    for (const item of cartItems) {
        const product = await Product.findOne({ _id: item.product })
        if (!product)
            throw new CustomError.NotFoundError(`No product with id: ${item.product}`)

        const { _id, name, price, image } = product
        const singleOrderItem = {
            name,
            price,
            image,
            amount: item.amount,
            product: _id
        }

        orderItems = [...orderItems, singleOrderItem]
        subtotal += item.amount * price
    }

    const total = subtotal + shippingFee + tax

    const paymentIntent = await StripeAPI({
        amount: total,
        currency: 'usd'
    })

    const order = await Order.create({
        tax,
        shippingFee,
        subtotal,
        total,
        orderItems,
        user: req.user.userId,
        clientSecret: paymentIntent.clientSecret
    })

    res.status(StatusCodes.CREATED).json({ clientSecret: order.clientSecret, order })
}

const getAllOrders = async (req, res) => {
    const orders = await Order.find({})
    res.status(StatusCodes.OK).json({ orders })
}

const getSingleOrder = async (req, res) => {
    res.send('get single order')
}

const getCurrentUserOrders = async (req, res) => {
    res.send('get curent order')
}

const updateOrder = async (req, res) => {
    res.send('update order')
}

module.exports = {
    createOrder,
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    updateOrder
}