const mongoose = require('mongoose')

const discountSchema = new mongoose.Schema(
  {
    discount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
)

const Discount = mongoose.model('Discount', discountSchema)

module.exports = Discount
