const stripe = require('stripe')(process.env.STRIPE_KEY)
const endpointSecret = process.env.WEBHOOK_SECRET
const Order = require('../models/Order')
const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY });
const DOMAIN = process.env.MAILGUN_DOMAIN

const success = async (req, res) => {
    res.send('success payment')
}

const cancel = async (req, res) => {
    res.send('cancelled payment')
}

const sendEmail = async ({ order, userId }) => {
    const user = await User.findOne({ _id: userId })

    let orderDetails = ''
    order.orderItems.forEach(item => {
        orderDetails += `${item.name} x ${item.amount} => $${(item.price / 100).toLocaleString()} <br>`
    })

    const emailDetails = {
        from: 'Yuru-Camp 🏕️ <camping-gears-store@mail.com>',
        to: [user.email],
        subject: 'Billing Info',
        text: 'Here are the things you have bought:',
        html: `
            <p>
                ${orderDetails} <br>
                <b>Total</b>: $${(order.total / 100).toLocaleString()}
            </p>
        `
    }

    const info = await mg.messages.create(DOMAIN, emailDetails)
    console.log(info)
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

            console.log(`Success Payment! Payment Intent Id: ${paymentIntent.id}`)
            await sendEmail({ order, userId: order.user })
            console.log('Sent Email')
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