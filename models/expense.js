const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema(
  {
    expense: {
      type: String,
    },
    amount: {
      type: Number,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true, versionKey: false }
)

const Expense = mongoose.model('Expense', expenseSchema)

module.exports = Expense
