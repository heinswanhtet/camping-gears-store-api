const mongoose = require('mongoose')

const connectDB = async (url) => mongoose.connect(url)

module.exports = connectDB
