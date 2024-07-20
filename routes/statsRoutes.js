const express = require('express')
const router = express.Router()
const statsController = require('../controllers/statsController')
const userJwt = require('../middlewares/userJwt')

router.get('/todaySales', userJwt, statsController.getSalesToday)
router.get('/productsSold', userJwt, statsController.getProductsSold)
router.get('/monthlySales', userJwt, statsController.getMonthlySales)
router.get(
  '/monthlyProductsSold',
  userJwt,
  statsController.getMonthlyProductCount
)
router.get('/categorySales', userJwt, statsController.getCategorySales)
router.get('/numordersday', userJwt, statsController.getOrderComparison)

router.get('/monthlyorders', userJwt, statsController.getMonthlyOrderCount)
router.get(
  '/getCategorySalesCustomRange',
  userJwt,
  statsController.getCategorySalesCustomRange
)

router.get('/monthlyBuy', userJwt, statsController.getMonthlyBuyPriceSum)

module.exports = router
