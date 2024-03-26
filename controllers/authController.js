const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { createTokenUser, attachCookiesToResponse } = require('../utils')

const register = async (req, res) => {
    const { name, email, password } = req.body

    const emailAlreadyExists = await User.findOne({ email })
    if (emailAlreadyExists)
        throw new CustomError.BadRequestError('Email already exists')

    const isFirstAccount = await User.countDocuments({}) === 0
    const role = isFirstAccount ? 'admin' : 'user'

    const user = await User.create({ name, email, password, role })

    const tokenUser = createTokenUser(user)
    attachCookiesToResponse({ res, user: tokenUser })

    res.status(StatusCodes.CREATED).json({ user: tokenUser })
}

const login = async (req, res) => {
    res.send('login')
}

const logout = async (req, res) => {
    res.send('logout')
}

module.exports = {
    register,
    login,
    logout
}