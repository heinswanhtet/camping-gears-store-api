require('dotenv').config()
require('express-async-errors')

// express
const express = require('express')
const app = express()

// utility packages
const morgan = require('morgan')

// security packages
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

// database
const connectDB = require('./db/connection')

// routers
const authRouter = require('./routes/authRoutes')

// middleware
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleWare = require('./middleware/error-handler')

app.set('trust proxy', 1)
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 60
    })
)
app.use(helmet())
app.use(xss())
app.use(cors())

app.use(morgan('tiny'))
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.use('/api/v1/auth', authRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleWare)

const port = process.env.PORT || 3000
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, () => {
            console.log(`Server is listening: http://localhost:${port}`)
        })
    } catch (error) {
        console.log(error)
    }
}

start()