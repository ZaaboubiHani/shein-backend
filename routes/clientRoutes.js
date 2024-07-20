const express = require('express')
const router = express.Router()
const clientController = require('../controllers/clientController')
const userJwt = require('../middlewares/userJwt')

router.post('/', userJwt, clientController.createClients)
router.get('/single', clientController.getOneClient)
router.get('/customer', clientController.getOneCustomer)
router.put('/:id', userJwt, clientController.updateClient)
module.exports = router
