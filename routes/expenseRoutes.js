const express = require('express')
const router = express.Router()
const expenseController = require('../controllers/expenseController')
const userJwt = require('../middlewares/userJwt')

router.post('/', userJwt, expenseController.createExpense)
router.get('/', userJwt, expenseController.getExpensesByDate)
router.get('/month', userJwt, expenseController.getExpensesByMonth)
router.delete('/:id', userJwt, expenseController.deleteExpense)
router.put('/:id', userJwt, expenseController.updateExpense)

module.exports = router
