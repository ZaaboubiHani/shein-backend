const express = require('express')
const router = express.Router()
const arrivalController = require('../controllers/arrivalController')
const userJwt = require('../middlewares/userJwt')

// Define routes

router.post('/', arrivalController.createArrival)
router.get('/', arrivalController.getArrivals)
router.put('/:id', arrivalController.updateArrival)

module.exports = router
