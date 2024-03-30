const express = require('express')
const router = express.Router()

const {
    createOrder,
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    cancelOrder
} = require('../controllers/orderController')
const { authenticateUser, authorizePermissions } = require('../middleware/authentication')

router.route('/')
    .get(authenticateUser, authorizePermissions('admin'), getAllOrders)
    .post(authenticateUser, createOrder)

router.route('/show-all-my-orders').get(authenticateUser, getCurrentUserOrders)

router.route('/:id')
    .get(authenticateUser, getSingleOrder)

router.route('/cancel/:id')
    .patch(authenticateUser, cancelOrder)

module.exports = router