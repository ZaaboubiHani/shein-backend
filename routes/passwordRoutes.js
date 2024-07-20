const express = require('express')
const router = express.Router()
const passwordController = require('../controllers/passwordController')
const userJwt = require('../middlewares/userJwt')

// Define routes

router.post('/', passwordController.createPassword)
router.post('/verify', passwordController.verifyPassword)
router.put('/', passwordController.updatePassword)
module.exports = router
