const express = require('express')
const router = express.Router()
const orderController = require('../controllers/orderController')
const userJwt = require('../middlewares/userJwt')

router.post('/', userJwt, orderController.createOrder)
router.get('/', userJwt, orderController.getOrdersByDay)
router.put('/:id', orderController.updateOrder)
router.get('/single', orderController.getOneOrder)
router.get('/client', orderController.getOrdersByClient)
module.exports = router
