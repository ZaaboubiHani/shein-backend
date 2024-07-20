const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    isDrafted: {
      type: Boolean,
      default: false,
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: false,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
)

const Category = mongoose.model('Category', categorySchema)

module.exports = Category
