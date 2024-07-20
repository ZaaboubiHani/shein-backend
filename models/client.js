const mongoose = require('mongoose')

const clientSchema = new mongoose.Schema(
  {
    barcode: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
)

const Client = mongoose.model('Client', clientSchema)

module.exports = Client
