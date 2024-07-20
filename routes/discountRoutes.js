const express = require('express')
const router = express.Router()
const discountController = require('../controllers/discountController')
const userJwt = require('../middlewares/userJwt')

// Define routes

router.post('/', userJwt, discountController.createDiscount)
router.get('/', userJwt, discountController.getSingleDiscount)
router.put('/', userJwt, discountController.updateDiscount)

module.exports = router
