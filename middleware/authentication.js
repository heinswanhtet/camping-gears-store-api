const CustomError = require('../errors')
const Token = require('../models/Token')
const { isTokenValid, attachCookiesToResponse } = require('../utils')
const { unlink } = require('fs').promises

const authenticateUser = async (req, res, next) => {
    const { accessToken, refreshToken } = req.signedCookies

    try {
        if (accessToken) {
            const payload = isTokenValid(accessToken)
            req.user = payload.user
            return next()
        }

        const payload = isTokenValid(refreshToken)

        const existingToken = await Token.findOne({
            user: payload.user.userId,
            refreshToken: payload.refreshToken
        })

        if (!existingToken || !existingToken?.isValid)
            throw new CustomError.UnauthenticatedError('Authentication Invalid')

        attachCookiesToResponse({ res, user: payload.user, refreshToken: existingToken.refreshToken })

        req.user = payload.user

        next()
    } catch (error) {
        throw new CustomError.UnauthenticatedError('Authentication Invalid')
    }
}

const authorizePermissions = (...roles) => {
    return async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            // if user submitted an image file and does not have permission,
            // delete the temp image stored when user submitted before throwing error
            if (req.files?.image) {
                await unlink(req.files.image.tempFilePath)

            }
            throw new CustomError.UnauthorizedError('Unauthorized to access this route')
        }
        next()
    }
}

module.exports = {
    authenticateUser,
    authorizePermissions
}