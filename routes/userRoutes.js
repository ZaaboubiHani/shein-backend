const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const userJwt = require('../middlewares/userJwt')

// Define routes

router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)
router.post('/verify', userJwt, userController.verifyJwt)
router.get('/', userJwt, userController.getUsers)
router.put('/:id', userJwt, userController.updateUser)
module.exports = router
