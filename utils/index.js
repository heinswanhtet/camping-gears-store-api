const { createJWT, isTokenValid, attachCookiesToResponse } = require('./jwt')
const createTokenUser = require('./createTokenUser')
const checkPermissions = require('./checkPermissions')
const sendInvoiceEmail = require('./sendInvoiceEmail')
const sendVerificationEmail = require('./sendVerificationEmail')
const sendResetPasswordEmail = require('./sendResetPasswordEmail')
const createHash = require('./createHash')
const sendSuccessResetPasswordEmail = require('./sendSuccessResetPasswordEmail')

module.exports = {
    createJWT,
    isTokenValid,
    attachCookiesToResponse,
    createTokenUser,
    checkPermissions,
    sendInvoiceEmail,
    sendVerificationEmail,
    sendResetPasswordEmail,
    createHash,
    sendSuccessResetPasswordEmail
}