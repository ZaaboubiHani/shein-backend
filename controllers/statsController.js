const Product = require('../models/product')
const Category = require('../models/category')
const Order = require('../models/order')
const Expense = require('../models/expense')

const getSalesToday = async (req, res) => {
  try {
    const isShipping = req.query.isShipping

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const yesterdayEnd = new Date(todayEnd)
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1)

    const [todayOrders, yesterdayOrders] = await Promise.all([
      Order.find({
        createdAt: { $gte: todayStart, $lte: todayEnd },
        isShipping: isShipping,
      }),
      Order.find({
        createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
        isShipping: isShipping,
      }),
    ])

    let todayRevenue = 0
    todayOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (!item.exchanged && !item.returned) {
          todayRevenue += item.finalPrice
        }
      })
    })

    let yesterdayRevenue = 0
    yesterdayOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (!item.exchanged && !item.returned) {
          yesterdayRevenue += item.finalPrice
        }
      })
    })

    const difference = todayRevenue - yesterdayRevenue
    const status = difference >= 0 ? 'gain' : 'loss'

    res.json({
      todayRevenue,
      yesterdayRevenue,
      status,
      difference,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate revenue comparison.',
      error: error.message,
    })
  }
}

const getProductsSold = async (req, res) => {
  try {
    const isShipping = req.query.isShipping
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const yesterdayEnd = new Date(todayEnd)
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1)

    const [todayOrders, yesterdayOrders] = await Promise.all([
      Order.find({
        createdAt: { $gte: todayStart, $lte: todayEnd },
        isShipping: isShipping,
      }),
      Order.find({
        createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
        isShipping: isShipping,
      }),
    ])

    let todayProductCount = 0
    todayOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (!item.exchanged && !item.returned) {
          todayProductCount++ // Count each item as one unit
        }
      })
    })

    let yesterdayProductCount = 0
    yesterdayOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (!item.exchanged && !item.returned) {
          yesterdayProductCount++ // Count each item as one unit
        }
      })
    })

    const difference = todayProductCount - yesterdayProductCount
    const status = difference >= 0 ? 'gain' : 'loss'

    res.json({
      todayProductCount,
      yesterdayProductCount,
      difference,
      status,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate product sales comparison.',
      error: error.message,
    })
  }
}

const getMonthlySales = async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    )

    let dailySales = {}
    const daysInMonth = endOfMonth.getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day)
      const dateString = `${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}`
      dailySales[dateString] = 0 // Initialize each day's revenue to zero with the full date
    }

    const orders = await Order.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      isShipping: false,
    })

    orders.forEach((order) => {
      const date = order.createdAt
      const dateString = `${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}`

      order.orderItems.forEach((item) => {
        if (!item.exchanged && !item.returned) {
          dailySales[dateString] += item.finalPrice // Add valid finalPrice to the corresponding date
        }
      })
    })

    // Convert dailySales to an array for response, sorted by date
    const salesData = Object.keys(dailySales)
      .map((date) => {
        return { date, revenue: dailySales[date] }
      })
      .sort(
        (a, b) =>
          new Date(a.date.split('-').reverse().join('-')) -
          new Date(b.date.split('-').reverse().join('-'))
      )

    res.json(salesData)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate monthly sales.',
      error: error.message,
    })
  }
}

const getMonthlyProductCount = async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    )

    let dailyProductCount = {}
    const daysInMonth = endOfMonth.getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day)
      const dateString = `${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}`
      dailyProductCount[dateString] = 0 // Initialize each day's product count to zero with the full date
    }

    const orders = await Order.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      isShipping: false,
    })

    orders.forEach((order) => {
      const date = order.createdAt
      const dateString = `${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}`

      order.orderItems.forEach((item) => {
        if (!item.exchanged && !item.returned) {
          dailyProductCount[dateString] += 1 // Increment by one for each valid product
        }
      })
    })

    // Convert dailyProductCount to an array for response, sorted by date
    const productCountData = Object.keys(dailyProductCount)
      .map((date) => {
        return { date, count: dailyProductCount[date] }
      })
      .sort(
        (a, b) =>
          new Date(a.date.split('-').reverse().join('-')) -
          new Date(b.date.split('-').reverse().join('-'))
      )

    res.json(productCountData)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate monthly product count.',
      error: error.message,
    })
  }
}

const getCategorySales = async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    )

    // Fetch all categories
    const categories = await Category.find({})
    let categorySales = {}

    // Initialize each category with zero sales and product count
    categories.forEach((category) => {
      categorySales[category._id.toString()] = {
        totalSales: 0,
        productCount: 0,
        categoryName: category.name,
      }
    })

    const orders = await Order.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      isShipping: false,
    }).populate('orderItems.product')

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (
          !item.exchanged &&
          !item.returned &&
          item.product &&
          item.product.category
        ) {
          const categoryId = item.product.category.toString()
          if (categorySales[categoryId]) {
            categorySales[categoryId].totalSales += item.finalPrice
            categorySales[categoryId].productCount += 1
          }
        }
      })
    })

    // Calculate the total sales for all categories to determine the percentages
    let totalSales = 0
    Object.values(categorySales).forEach((data) => {
      totalSales += data.totalSales
    })

    // Now, calculate the percentage of total sales for each category and sort by percentage
    const salesData = Object.keys(categorySales)
      .map((categoryId) => {
        const category = categorySales[categoryId]
        const percentageOfTotal =
          totalSales > 0 ? (category.totalSales / totalSales) * 100 : 0
        return {
          category: categoryId,
          categoryName: category.categoryName,
          totalSales: category.totalSales,
          productCount: category.productCount,
          percentageOfTotal: parseFloat(percentageOfTotal.toFixed(2)), // Limit decimal places for readability
        }
      })
      .sort((a, b) => b.percentageOfTotal - a.percentageOfTotal) // Sort by percentage from highest to lowest

    res.json(salesData)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate monthly category sales with percentages.',
      error: error.message,
    })
  }
}

const getOrderComparison = async (req, res) => {
  try {
    const isShipping = req.query.isShipping
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const yesterdayEnd = new Date(todayEnd)
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1)

    const [todayOrders, yesterdayOrders] = await Promise.all([
      Order.find({
        createdAt: { $gte: todayStart, $lte: todayEnd },
        isShipping: isShipping,
      }),
      Order.find({
        createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
        isShipping: isShipping,
      }),
    ])

    const todayOrderCount = todayOrders.length
    const yesterdayOrderCount = yesterdayOrders.length

    const difference = todayOrderCount - yesterdayOrderCount
    const status = difference >= 0 ? 'gain' : 'loss'

    res.json({
      todayOrderCount,
      yesterdayOrderCount,
      difference,
      status,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate order count comparison.',
      error: error.message,
    })
  }
}

const getMonthlyOrderCount = async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    )

    let dailyOrderCount = {}
    const daysInMonth = endOfMonth.getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day)
      const dateString = `${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}`
      dailyOrderCount[dateString] = 0 // Initialize each day's order count to zero
    }

    const orders = await Order.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      isShipping: false,
    })

    orders.forEach((order) => {
      const date = order.createdAt
      const dateString = `${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}`

      // Increment the order count for the corresponding date
      dailyOrderCount[dateString] += 1
    })

    // Convert dailyOrderCount to an array for response, sorted by date
    const orderCountData = Object.keys(dailyOrderCount)
      .map((date) => {
        return { date, count: dailyOrderCount[date] }
      })
      .sort(
        (a, b) =>
          new Date(a.date.split('-').reverse().join('-')) -
          new Date(b.date.split('-').reverse().join('-'))
      )

    res.json(orderCountData)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate monthly order count.',
      error: error.message,
    })
  }
}

const getCategorySalesCustomRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both startDate and endDate query parameters.',
      })
    }

    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0) // Ensure start of the day
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999) // Ensure end of the day

    // Fetch all categories
    const categories = await Category.find({})
    let categorySales = {}

    // Initialize each category with zero sales and product count
    categories.forEach((category) => {
      categorySales[category._id.toString()] = {
        totalSales: 0,
        productCount: 0,
        categoryName: category.name,
      }
    })

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      isShipping: false,
    }).populate('orderItems.product')

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (
          !item.exchanged &&
          !item.returned &&
          item.product &&
          item.product.category
        ) {
          const categoryId = item.product.category.toString()
          if (categorySales[categoryId]) {
            categorySales[categoryId].totalSales += item.finalPrice
            categorySales[categoryId].productCount += 1
          }
        }
      })
    })

    // Calculate the total sales for all categories to determine the percentages
    let totalSales = 0
    Object.values(categorySales).forEach((data) => {
      totalSales += data.totalSales
    })

    // Now, calculate the percentage of total sales for each category and sort by percentage
    const salesData = Object.keys(categorySales)
      .map((categoryId) => {
        const category = categorySales[categoryId]
        const percentageOfTotal =
          totalSales > 0 ? (category.totalSales / totalSales) * 100 : 0
        return {
          category: categoryId,
          categoryName: category.categoryName,
          totalSales: category.totalSales,
          productCount: category.productCount,
          percentageOfTotal: parseFloat(percentageOfTotal.toFixed(2)), // Limit decimal places for readability
        }
      })
      .sort((a, b) => b.percentageOfTotal - a.percentageOfTotal) // Sort by percentage from highest to lowest

    res.json(salesData)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate category sales for custom date range.',
      error: error.message,
    })
  }
}

const getMonthlyBuyPriceSum = async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    )

    let dailyData = {}
    const daysInMonth = endOfMonth.getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day)
      const dateString = `${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}`
      dailyData[dateString] = { revenue: 0, buyPriceSum: 0, totalExpenses: 0 } // Initialize each day's data to zero
    }

    const orders = await Order.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      isShipping: false,
    }).populate('orderItems.product')

    orders.forEach((order) => {
      const date = order.createdAt
      const dateString = `${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}`

      order.orderItems.forEach((item) => {
        if (!item.exchanged && !item.returned && item.product) {
          dailyData[dateString].buyPriceSum += item.product.buyPrice // Sum up the buyPrice for each day
          dailyData[dateString].revenue += item.finalPrice // Add valid finalPrice to the corresponding date
        }
      })
    })

    const expenses = await Expense.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    })

    expenses.forEach((expense) => {
      const date = expense.createdAt
      const dateString = `${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}`

      dailyData[dateString].totalExpenses += expense.amount // Sum up the expenses for each day
    })

    // Convert dailyData to an array for response, sorted by date
    const resultData = Object.keys(dailyData)
      .map((date) => {
        return { date, ...dailyData[date] }
      })
      .sort(
        (a, b) =>
          new Date(a.date.split('-').reverse().join('-')) -
          new Date(b.date.split('-').reverse().join('-'))
      )

    res.json(resultData)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate daily sales, buy price sum, and expenses.',
      error: error.message,
    })
  }
}

module.exports = {
  getSalesToday,
  getProductsSold,
  getMonthlySales,
  getMonthlyProductCount,
  getCategorySales,
  getOrderComparison,
  getMonthlyOrderCount,
  getCategorySalesCustomRange,
  getMonthlyBuyPriceSum,
}
