const sendEmail = require('./sendEmail')
const User = require('../models/User')

const sendInvoiceEmail = async ({ order }) => {
    const user = await User.findOne({ _id: order.user })

    let orderDetailsMessage = ''
    order.orderItems.forEach(item => {
        orderDetailsMessage += `${item.name} x ${item.amount} => $${(item.price / 100).toLocaleString()} <br>`
    })

    return sendEmail({
        to: user.email,
        subject: 'Invoice',
        html: `
            <h4>Hello, ${user.name}</h4>
            <p>
                ${orderDetailsMessage}
                Total: $${order.total}
            </p>
        `
    })

}

module.exports = sendInvoiceEmail