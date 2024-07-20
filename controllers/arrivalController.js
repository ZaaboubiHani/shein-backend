const Arrival = require('../models/arrival')
const Product = require('../models/product')

const createArrival = async (req, res) => {
  try {
    const newArrival = new Arrival({
      ...req.body,
    })

    let createdArrival = await newArrival.save()
    createdArrival = await Arrival.findOne(createArrival._id).populate([
      {
        path: 'category',
        select: 'name',
      },
      {
        path: 'items.category',
        select: 'name',
      },
    ])
    res.status(200).json(createdArrival)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error creating Arrival' })
  }
}

const updateArrival = async (req, res) => {
  const arrivalId = req.params.id
  try {
    const updatedArrival = await Arrival.findByIdAndUpdate(
      arrivalId,
      req.body,
      { new: true }
    )

    if (!updatedArrival) {
      return res.status(404).json({ error: 'Arrival not found' })
    }

    res.status(200).json(updatedArrival)
  } catch (error) {
    res.status(500).json({ error: 'Error updating Arrival' })
  }
}
const getArrivals = async (req, res) => {
  try {
    const query = {
      isDrafted: false,
    }

    if (req.query.name) {
      query.name = { $regex: new RegExp(req.query.name, 'i') }
    }
    if (req.query.startDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
      }
    }
    if (req.query.endDate) {
      query.date = {
        $lte: new Date(req.query.endDate),
      }
    }
    const arrivals = await Arrival.find(query)
      .populate([
        {
          path: 'category',
          select: 'name',
        },
        {
          path: 'items.category',
          select: 'name',
        },
      ])
      .sort({ createdAt: -1 })
      .lean()
    for (let arrival of arrivals) {
      const inSaleTrueCount = await Product.countDocuments({
        arrival: arrival._id,
        inSale: true,
        isSold: false,
      })
      const inSaleFalseCount = await Product.countDocuments({
        arrival: arrival._id,
        inSale: false,
        isSold: false,
      })
      const isSoldTrueCount = await Product.countDocuments({
        arrival: arrival._id,
        isSold: true,
      })

      arrival.productCounts = {
        inSaleTrueCount,
        inSaleFalseCount,
        isSoldTrueCount,
      }
    }

    res.status(200).json(arrivals)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error fetching arrivals' })
  }
}
module.exports = {
  createArrival,
  updateArrival,
  getArrivals,
}
