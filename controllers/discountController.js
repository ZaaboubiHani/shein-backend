const Discount = require('../models/discount')

const createDiscount = async (req, res) => {
  try {
    const newDiscount = new Discount({
      ...req.body,
    })

    const createdDiscount = await newDiscount.save()

    res.status(200).json(createdDiscount)
  } catch (error) {
    res.status(500).json({ error: 'Error creating Discount' })
  }
}

const updateDiscount = async (req, res) => {
  const discount = await Discount.findOne()
  try {
    const updatedDiscount = await Discount.findByIdAndUpdate(
      discount._id,
      req.body,
      { new: true }
    )

    if (!updatedDiscount) {
      return res.status(404).json({ error: 'Discount not found' })
    }

    res.status(200).json(updatedDiscount)
  } catch (error) {
    res.status(500).json({ error: 'Error updating Discount' })
  }
}

const getSingleDiscount = async (req, res) => {
  try {
    const discount = await Discount.findOne()
    res.status(200).json(discount)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching Discount' })
  }
}

module.exports = {
  createDiscount,
  getSingleDiscount,
  updateDiscount,
}
