const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      default: '',
    },
    birthDate: {
      type: Date,
    },
    address: {
      type: String,
      default: '',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    barcode: {
      type: String,
      unique: true,
    },
    isDrafted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
)

const Customer = mongoose.model('Customer', customerSchema)

module.exports = Customer
