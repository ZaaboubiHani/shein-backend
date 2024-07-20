const express = require('express')
const router = express.Router()
const customerController = require('../controllers/customerController')
const userJwt = require('../middlewares/userJwt')

// Define routes

router.post('/', customerController.createCustomer)
router.get('/', customerController.getCustomers)
router.put('/:id', customerController.updateCustomer)

module.exports = router
