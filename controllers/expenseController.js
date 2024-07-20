const Expense = require('../models/expense')

const createExpense = async (req, res) => {
  try {
    const expenseData = { ...req.body, user: req.user.userId }
    const newExpense = new Expense(expenseData)
    const createdExpense = await newExpense.save()
    res.status(200).json(createdExpense)
  } catch (error) {
    console.error('Error creating Expense:', error)
    res.status(500).json({ error: 'Error creating Expense' })
  }
}

const getExpensesByDate = async (req, res) => {
  try {
    const { date } = req.query
    if (!date) {
      return res.status(400).json({ error: 'Date query parameter is required' })
    }
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    const expenses = await Expense.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      user: req.user.userId,
    })
      .populate('user', 'username')
      .sort({ createdAt: -1 })

    res.status(200).json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    res.status(500).json({ error: 'Error fetching expenses' })
  }
}

const deleteExpense = async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id)
    if (!deletedExpense) {
      return res.status(404).json({ error: 'Expense not found' })
    }
    res.status(200).json(deletedExpense)
  } catch (error) {
    console.error('Error deleting expense:', error)
    res.status(500).json({ error: 'Error deleting expense' })
  }
}

const updateExpense = async (req, res) => {
  const expenseId = req.params.id
  try {
    const updatedCategory = await Expense.findByIdAndUpdate(
      expenseId,
      req.body,
      { new: true }
    )

    if (!updatedCategory) {
      return res.status(404).json({ error: 'Expense not found' })
    }

    res.status(200).json(updatedCategory)
  } catch (error) {
    res.status(500).json({ error: 'Error updating Expense' })
  }
}

const getExpensesByMonth = async (req, res) => {
  try {
    const { month, year } = req.query
    if (!month || !year) {
      return res
        .status(400)
        .json({ error: 'Month and year query parameters are required' })
    }

    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0)
    endOfMonth.setHours(23, 59, 59, 999)

    const expenses = await Expense.find({
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
      user: req.user.userId,
    })
      .populate('user', 'username')
      .sort({ createdAt: -1 })

    res.status(200).json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    res.status(500).json({ error: 'Error fetching expenses' })
  }
}

module.exports = {
  createExpense,
  getExpensesByDate,
  deleteExpense,
  updateExpense,
  getExpensesByMonth,
}
