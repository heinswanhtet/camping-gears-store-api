const Order = require('../models/Order')
const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { checkPermissions } = require('../utils')
const stripe = require('stripe')(process.env.STRIPE_KEY)

const stripePayment = async ({ orderId, orderItems, currency }) => {
    const session = await stripe.checkout.sessions.create({
        // shipping_address_collection: {
        //     allowed_countries: ['US', 'CA'],
        // },
        // shipping_options: [
        //     {
        //         shipping_rate_data: {
        //             type: 'fixed_amount',
        //             fixed_amount: {
        //                 amount: 0,
        //                 currency: 'usd',
        //             },
        //             display_name: 'Free shipping',
        //             delivery_estimate: {
        //                 minimum: {
        //                     unit: 'business_day',
        //                     value: 5,
        //                 },
        //                 maximum: {
        //                     unit: 'business_day',
        //                     value: 7,
        //                 },
        //             },
        //         },
        //     },
        //     {
        //         shipping_rate_data: {
        //             type: 'fixed_amount',
        //             fixed_amount: {
        //                 amount: 1500,
        //                 currency: 'usd',
        //             },
        //             display_name: 'Next day air',
        //             delivery_estimate: {
        //                 minimum: {
        //                     unit: 'business_day',
        //                     value: 1,
        //                 },
        //                 maximum: {
        //                     unit: 'business_day',
        //                     value: 1,
        //                 },
        //             },
        //         },
        //     },
        // ],
        line_items: orderItems.map(item => {
            return {
                price_data: {
                    currency: currency,
                    product_data: {
                        name: item.name,
                        images: [item.image],
                        metadata: {
                            productId: item.product.toString(),
                        }
                    },
                    unit_amount: item.price
                },
                quantity: item.amount
            }
        }),
        payment_intent_data: {
            metadata: {
                orderId: orderId.toString()
            },
        },
        automatic_tax: {
            enabled: true,
        },
        metadata: {
            orderId: orderId.toString()
        },
        mode: 'payment',
        success_url: `${process.env.DOMAIN}/stripe/success`,
        cancel_url: `${process.env.DOMAIN}/stripe/cancel`
    })

    return session
}

const createOrder = async (req, res) => {
    const { items: cartItems } = req.body

    if (!cartItems || cartItems.length < 1)
        throw new CustomError.BadRequestError('No cart items provided! Please provide them')

    let orderItems = []

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
    }

    const order = await Order.create({
        orderItems,
        user: req.user.userId,
    })

    const session = await stripePayment({
        orderId: order._id,
        orderItems,
        currency: 'usd'
    })

    order.checkoutSessionId = session.id
    await order.save()

    res.status(StatusCodes.SEE_OTHER).json({ redirect_link: session.url, session })
}

const getAllOrders = async (req, res) => {
    const orders = await Order.find({})
    res.status(StatusCodes.OK).json({ total: orders.length, orders })
}

const getSingleOrder = async (req, res) => {
    const { id: orderId } = req.params

    const order = await Order.findOne({ _id: orderId })
    if (!orderId)
        throw new CustomError.NotFoundError(`No order with id: ${orderId}`)

    checkPermissions({ requestUser: req.user, resourceUserId: order.user })

    res.status(StatusCodes.OK).json({ order })
}

const getCurrentUserOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user.userId })
    res.status(StatusCodes.OK).json({ total: orders.length, orders })
}

const cancelOrder = async (req, res) => {
    const { id: orderId } = req.params
    // const { paymentIntentId } = req.body

    // if (!paymentIntentId)
    //     throw new CustomError.BadRequestError('Please provide payment intent id')

    const order = await Order.findOne({ _id: orderId })
    if (!orderId)
        throw new CustomError.NotFoundError(`No order with id: ${orderId}`)

    checkPermissions({ requestUser: req.user, resourceUserId: order.user })

    // order.paymentIntentId = paymentIntentId
    order.status = 'canceled'
    await order.save()

    res.status(StatusCodes.OK).json({ order })
}

module.exports = {
    createOrder,
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    cancelOrder
}