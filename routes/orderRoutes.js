const express = require('express')
const router = express.Router()

const {
    createOrder,
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    updateOrder
} = require('../controllers/orderController')
const { authenticateUser, authorizePermissions } = require('../middleware/authentication')

router.route('/')
    .get(authenticateUser, authorizePermissions('admin'), getAllOrders)
    .post(authenticateUser, createOrder)

router.route('/show-all-my-orders').get(authenticateUser, getCurrentUserOrders)

router.route('/:id')
    .get(authenticateUser, getSingleOrder)
    .patch(authenticateUser, updateOrder)

module.exports = router