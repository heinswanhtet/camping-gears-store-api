const { createJWT, isTokenValid, attachCookiesToResponse } = require('./jwt')
const createTokenUser = require('./createTokenUser')
const checkPermissions = require('./checkPermissions')
const sendInvoiceEmail = require('./sendInvoiceEmail')
const sendVerificationEmail = require('./sendVerificationEmail')

module.exports = {
    createJWT,
    isTokenValid,
    attachCookiesToResponse,
    createTokenUser,
    checkPermissions,
    sendInvoiceEmail,
    sendVerificationEmail
}