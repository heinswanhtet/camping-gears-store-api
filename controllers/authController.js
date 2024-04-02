const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { createTokenUser, attachCookiesToResponse, sendVerificationEmail, sendResetPasswordEmail, createHash, sendSuccessResetPasswordEmail } = require('../utils')
const crypto = require('crypto')
const Token = require('../models/Token')

const register = async (req, res) => {
    const { name, email, password } = req.body

    const emailAlreadyExists = await User.findOne({ email })
    if (emailAlreadyExists)
        throw new CustomError.BadRequestError('Email already exists')

    const isFirstAccount = await User.countDocuments({}) === 0
    const role = isFirstAccount ? 'admin' : 'user'

    const verificationToken = crypto.randomBytes(40).toString('hex')

    const user = await User.create({ name, email, password, role, verificationToken })

    const forwardedHost = req.get('x-forwarded-host')
    await sendVerificationEmail({
        name: user.name,
        email: user.email,
        verificationToken: user.verificationToken,
        origin: forwardedHost
    })

    res.status(StatusCodes.CREATED).json({ msg: 'Success! Please check your email to verify account' })
}

const verifyEmail = async (req, res) => {
    const { verificationToken, email } = req.body

    const user = await User.findOne({ email })
    if (!user)
        throw new CustomError.UnauthenticatedError('Verification Failed')

    if (user.verificationToken !== verificationToken)
        throw new CustomError.UnauthenticatedError('Verification Failed')

    user.isVerified = true
    user.verificationToken = ''
    await user.save()

    res.status(StatusCodes.OK).json({ msg: 'Email Verified' })
}

const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password)
        throw new CustomError.BadRequestError('Please provide email and password')

    const user = await User.findOne({ email })
    if (!user)
        throw new CustomError.UnauthenticatedError('Invalid Credentials')

    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect)
        throw new CustomError.UnauthenticatedError('Invalid Credentials')

    if (!user.isVerified)
        throw new CustomError.UnauthenticatedError('Please verify your email')

    const tokenUser = createTokenUser(user)

    let refreshToken = ''
    const existingToken = await Token.findOne({ user: user._id })

    if (existingToken) {
        const { isValid } = existingToken
        if (!isValid)
            throw new CustomError.UnauthenticatedError('Invalid Credentials')
        refreshToken = existingToken.refreshToken
    }
    else {
        refreshToken = crypto.randomBytes(40).toString('hex')
        const ip = req.ip
        const userAgent = req.headers['user-agent']
        const userToken = { refreshToken, ip, userAgent, user: user._id }
        await Token.create(userToken)
    }

    attachCookiesToResponse({ res, user: tokenUser, refreshToken })

    res.status(StatusCodes.OK).json({ user: tokenUser })
}

const logout = async (req, res) => {
    await Token.findOneAndDelete({ user: req.user.userId })

    res.cookie('accessToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    res.cookie('refreshToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })

    res.status(StatusCodes.OK).json({ msg: 'user logged out!' })
}

const forgotPassword = async (req, res) => {
    const { email } = req.body
    if (!email)
        throw new CustomError.BadRequestError('Please provide valid email')

    const user = await User.findOne({ email })
    if (user) {
        const passwordToken = crypto.randomBytes(40).toString('hex')
        const forwardedHost = req.get('x-forwarded-host')
        await sendResetPasswordEmail({
            name: user.name,
            email: user.email,
            token: passwordToken,
            origin: forwardedHost
        })

        const tenMinutes = 1000 * 60 * 10
        const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes)

        user.passwordToken = createHash(passwordToken)
        user.passwordTokenExpirationDate = passwordTokenExpirationDate

        await user.save()
    }

    res.status(StatusCodes.OK).json({ msg: 'Please check your email for reset password link' })
}

const resetPassword = async (req, res) => {
    const { token, email, password } = req.body
    if (!token || !email || !password)
        throw new CustomError.BadRequestError('Please provide all required values')

    const user = await User.findOne({ email })

    if (user) {
        const currentDate = new Date()

        if (user.passwordToken === createHash(token) && user.passwordTokenExpirationDate > currentDate) {
            user.password = password
            user.passwordToken = null
            user.passwordTokenExpirationDate = null

            await user.save()

            const forwardedHost = req.get('x-forwarded-host')
            sendSuccessResetPasswordEmail({
                name: user.name,
                email: user.email,
                origin: forwardedHost
            })
        }
    }

    res.status(StatusCodes.OK).json({ msg: 'reset password' })
}

module.exports = {
    register,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword
}