const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ['Admin', 'Cashier'],
    },
    passwordHash: {
      type: String,
      required: true,
    },
    isDrafted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
)

const User = mongoose.model('User', userSchema)

module.exports = User
