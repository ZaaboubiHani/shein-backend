const Order = require('../models/order')
const Product = require('../models/product')

const createOrder = async (req, res) => {
  try {
    console.log(req.user)
    const orderData = { ...req.body, user: req.user.userId }
    const newOrder = new Order(orderData)
    const createdOrder = await newOrder.save()
    const productUpdates = createdOrder.orderItems.map(async (item) => {
      return await Product.findByIdAndUpdate(item.product, { isSold: true })
    })
    await Promise.all(productUpdates)
    res.status(200).json(createdOrder)
  } catch (error) {
    console.error('Error creating Order:', error)
    res.status(500).json({ error: 'Error creating Order' })
  }
}

const updateOrder = async (req, res) => {
  const orderId = req.params.id
  const { orderItems } = req.body

  try {
    const updatedOrder = await Order.findByIdAndUpdate(orderId, req.body, {
      new: true,
    })
      .populate({
        path: 'orderItems.product',
        select: 'name',
      })
      .populate({
        path: 'orderItems.exchangeDetails.newProduct',
        select: 'name',
      })

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' })
    }
    if (orderItems && orderItems.length > 0) {
      const returnedItems = orderItems.filter((item) => item.returned === true)
      const updatePromises = returnedItems.map(async (item) => {
        return await Product.findByIdAndUpdate(item.product, { isSold: false })
      })

      await Promise.all(updatePromises)
    }

    res.status(200).json(updatedOrder)
  } catch (error) {
    res.status(500).json({ error: 'Error updating Order' })
  }
}

const getOneOrder = async (req, res) => {
  const queryParam = req.query.reference

  try {
    // Try to fetch by product barcode
    let order = await Order.findOne({
      'orderItems.product': await Product.findOne({
        barcode: queryParam,
      }).select('_id'),
    })
      .populate({
        path: 'orderItems.product',
        select: 'name',
      })
      .populate({
        path: 'orderItems.exchangeDetails.newProduct',
        select: 'name',
      })
      .populate({
        path: 'client',
      })

    if (!order) {
      order = await Order.findOne({
        reference: `#${queryParam}`,
      })
        .populate({
          path: 'orderItems.product',
          select: 'name',
        })
        .populate({
          path: 'orderItems.exchangeDetails.newProduct',
          select: 'name',
        })
        .populate({
          path: 'client',
        })
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.status(200).json(order)
  } catch (error) {
    res.status(500).json({ error: 'Error getting Order' })
    console.error(error)
  }
}

const getOrdersByDay = async (req, res) => {
  const dateParam = req.query.date
  const isShipping = req.query.isShipping

  try {
    const date = new Date(dateParam)
    const startOfDay = new Date(date.setHours(0, 0, 0, 0))
    const endOfDay = new Date(date.setHours(23, 59, 59, 999))

    const orders = await Order.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      isShipping: isShipping,
    })
      .populate({
        path: 'orderItems.product',
        select: 'name',
      })
      .populate({
        path: 'orderItems.exchangeDetails.newProduct',
        select: 'name',
      })

    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({ error: 'Error getting orders' })
    console.error(error)
  }
}

const getOrdersByClient = async (req, res) => {
  const client = req.query.client

  try {
    const orders = await Order.find({
      client: client,
    })
      .populate({
        path: 'orderItems.product',
        select: 'name',
      })
      .populate({
        path: 'orderItems.exchangeDetails.newProduct',
        select: 'name',
      })
      .sort({ createdAt: -1 })

    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({ error: 'Error getting orders' })
    console.error(error)
  }
}

module.exports = {
  createOrder,
  updateOrder,
  getOneOrder,
  getOrdersByDay,
  getOrdersByClient,
}
