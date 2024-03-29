const CustomError = require('../errors')
const { isTokenValid } = require('../utils')
const { unlink } = require('fs').promises

const authenticateUser = (req, res, next) => {
    const token = req.signedCookies.token

    if (!token)
        throw new CustomError.UnauthenticatedError('Authentication Invalid')

    try {
        const { userId, name, role } = isTokenValid({ token })
        req.user = { userId, name, role }
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