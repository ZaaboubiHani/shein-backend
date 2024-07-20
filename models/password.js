const mongoose = require('mongoose')

const passwordSchema = new mongoose.Schema(
  {
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
)

const Password = mongoose.model('Password', passwordSchema)

module.exports = Password
