const { mg, DOMAIN } = require('./mailgunConfig')

const sendEmail = async ({ to, subject, html }) => {
    const emailDetails = {
        from: 'Wonderful Camping Store 🏕️ <camping-gears-store@mail.com>',
        to,
        subject,
        html
    }

    return mg.messages.create(DOMAIN, emailDetails)
}

module.exports = sendEmail