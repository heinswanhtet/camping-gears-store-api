const express = require('express')
const router = express.Router()

const {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
} = require('../controllers/userController')
const { route } = require('express/lib/router')

router.route('/').get(getAllUsers)

router.route('/show-me').get(showCurrentUser)
router.route('/update-user').patch(updateUser)
router.route('/update-user-password').patch(updateUserPassword)

router.route('/:id').get(getSingleUser)

module.exports = router