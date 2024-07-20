const mongoose = require('mongoose')

const counterSchema = new mongoose.Schema({
  date: String,
  counter: {
    type: Number,
    default: 1,
  },
})

const Counter = mongoose.model('Counter', counterSchema)

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  sellPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  finalPrice: {
    type: Number,
  },
  exchanged: {
    type: Boolean,
    default: false,
  },
  exchangeDetails: {
    name: {
      type: String,
    },
    newProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    sellPrice: {
      type: Number,
    },
  },
  returned: {
    type: Boolean,
    default: false,
  },
})

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    reference: {
      type: String,
    },
    phone: {
      type: String,
    },
    total: {
      type: Number,
    },
    versement: {
      type: Number,
      default: 0,
    },
    note: {
      type: String,
    },
    isShipping: {
      type: Boolean,
      default: false,
    },
    shipping: {
      fullName: {
        type: String,
      },
      address: {
        type: String,
      },
      wilaya: {
        type: String,
      },
      commune: {
        type: String,
      },
      phoneNumber: {
        type: String,
      },
    },
    orderItems: [orderItemSchema],
  },
  { timestamps: true, versionKey: false }
)

orderSchema.pre('save', async function (next) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '') // format yyyymmdd
  const result = await Counter.findOneAndUpdate(
    { date: today },
    { $inc: { counter: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )

  // Update the reference field in the order document
  this.reference = `#${today}${result.counter}`
  next()
})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order
