const sendEmail = require('./sendEmail')

const sendSuccessResetPasswordEmail = async ({ name, email, origin }) => {
    const login = `${origin}/user/login`

    const message = `
        <p>
            Please login with your new password: 
            <a href=${login}>Login</a>
        </p>
    `

    return sendEmail({
        to: email,
        subject: 'Successfully Resetting Password',
        html: `
            <h4>Hello, ${name}</h4>
            ${message}
        `
    })
}

module.exports = sendSuccessResetPasswordEmail