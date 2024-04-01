const stripe = require('stripe')(process.env.STRIPE_KEY)
const endpointSecret = process.env.WEBHOOK_SECRET
const Order = require('../models/Order')
const { StatusCodes } = require('http-status-codes')
const { sendInvoiceEmail } = require('../utils')

const success = async (req, res) => {
    res.send('success payment')
}

const cancel = async (req, res) => {
    res.send('cancelled payment')
}

const webhook = async (req, res) => {
    let event = req.body
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
        // Get the signature sent by Stripe
        const signature = req.headers['stripe-signature']
        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                endpointSecret
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`, err.message)
            return res.sendStatus(400)
        }
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            // const checkoutSession = event.data.object
            // console.log(`Checkout Session Id: ${checkoutSession.id}`)
            break

        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object

            const { orderId } = paymentIntent.metadata
            const order = await Order.findOne({ _id: orderId })

            order.paymentIntentId = paymentIntent.id
            order.total = paymentIntent.amount
            order.status = 'paid'
            await order.save()

            // console.log(`Success Payment! Payment Intent Id: ${paymentIntent.id}`)

            try {
                await sendInvoiceEmail({ order })
                // console.log('Success sending invoice email!')
            } catch (error) {
                console.log(error)
            }

            break

        default:
        // console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(StatusCodes.OK).send()
}

module.exports = {
    success,
    cancel,
    webhook
}