const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { createTokenUser, attachCookiesToResponse, sendVerificationEmail } = require('../utils')
const crypto = require('crypto')

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

    const tokenUser = createTokenUser(user)
    attachCookiesToResponse({ res, user: tokenUser })

    res.status(StatusCodes.OK).json({ user: tokenUser })

}

const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })

    res.status(StatusCodes.OK).json({ msg: 'Successfully logged out!' })
}

module.exports = {
    register,
    login,
    logout
}