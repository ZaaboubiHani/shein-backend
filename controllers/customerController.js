const Customer = require('../models/customer')
const Client = require('../models/client')

const createCustomer = async (req, res) => {
  try {
    const newCustomer = new Customer({
      ...req.body,
    })

    const createdCustomer = await newCustomer.save()

    res.status(200).json(createdCustomer)
  } catch (error) {
    res.status(500).json({ error: 'Error creating customer' })
    console.error(error)
  }
}

const updateCustomer = async (req, res) => {
  const customerId = req.params.id
  const { phone } = req.body // Assuming phone number is included in the request body

  try {
    // Find and update the customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      req.body,
      { new: true }
    )

    if (!updatedCustomer) {
      return res.status(404).json({ error: 'Customer not found' })
    }

    // If the customer has an associated client, update the client's phone number
    if (updatedCustomer.client) {
      await Client.findByIdAndUpdate(updatedCustomer.client, { phone })
    }

    res.status(200).json(updatedCustomer)
  } catch (error) {
    res.status(500).json({ error: 'Error updating customer' })
  }
}
const getCustomers = async (req, res) => {
  try {
    const { phone } = req.query
    const query = { isDrafted: false }

    if (phone) {
      const regex = { $regex: phone, $options: 'i' }
      query.$or = [{ phone: regex }, { fullName: regex }, { barcode: regex }]
    }

    const customers = await Customer.find(query).sort({
      createdAt: -1,
    })

    res.status(200).json(customers)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error fetching customers' })
  }
}

module.exports = {
  createCustomer,
  updateCustomer,
  getCustomers,
}
