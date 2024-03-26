const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { checkPermissions } = require('../utils')
const { createTokenUser, attachCookiesToResponse } = require('../utils')

const getAllUsers = async (req, res) => {
    const users = await User.find({ role: 'user' }).select('-password')
    res.status(StatusCodes.OK).json({ users })
}

const getSingleUser = async (req, res) => {
    const user = await User.findOne({ _id: req.params.id }).select('-password')
    // actually this user checking condition is not needed, it has been handled
    // in the error-handler.js
    if (!user) {
        throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`)
    }

    checkPermissions({ requestUser: req.user, resourceUserId: user._id })
    res.status(StatusCodes.OK).json({ user })
}

const showCurrentUser = async (req, res) => {
    res.status(StatusCodes.OK).json({ user: req.user })
}

const updateUser = async (req, res) => {
    const { name, email } = req.body
    if (!name || !email)
        throw new CustomError.BadRequestError('Please provide all values')

    const user = await User.findOne({ _id: req.user.userId })

    user.name = name
    user.email = email

    await user.save()

    const tokenUser = createTokenUser(user)
    attachCookiesToResponse({ res, user: tokenUser })

    res.status(StatusCodes.OK).json({ user: tokenUser })
}

const updateUserPassword = async (req, res) => {
    res.send('update user password')
}

module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
}