// pages/api/admin/analytics.js
import jwt from 'jsonwebtoken'
import { readData } from '../../../lib/dataStore'

const JWT_SECRET = 'petuk-admin-secret-key-2024'

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

function calculateAnalytics(orders, timeframe) {
  const now = new Date()
  let startDate = new Date()
  
  // Set the start date based on timeframe (using UTC)
  if (timeframe === 'today') {
    startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
  } else if (timeframe === 'week') {
    const weekAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 7)
    startDate = new Date(Date.UTC(weekAgo.getUTCFullYear(), weekAgo.getUTCMonth(), weekAgo.getUTCDate(), 0, 0, 0, 0))
  } else if (timeframe === 'month') {
    const monthAgo = new Date(now)
    monthAgo.setDate(now.getDate() - 30)
    startDate = new Date(Date.UTC(monthAgo.getUTCFullYear(), monthAgo.getUTCMonth(), monthAgo.getUTCDate(), 0, 0, 0, 0))
  } else if (timeframe === 'year') {
    const yearAgo = new Date(now)
    yearAgo.setFullYear(now.getFullYear() - 1)
    startDate = new Date(Date.UTC(yearAgo.getUTCFullYear(), yearAgo.getUTCMonth(), yearAgo.getUTCDate(), 0, 0, 0, 0))
  }

  // Filter orders for the timeframe
  // Count all orders except cancelled ones for revenue
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt)
    return orderDate >= startDate && orderDate <= now && order.status !== 'cancelled'
  })

  // Calculate totals
  const totalOrders = filteredOrders.length
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0)
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  // Calculate payment method breakdown
  const paymentMethods = { razorpay: 0, cod: 0 }
  filteredOrders.forEach(order => {
    if (order.payment_method === 'razorpay') {
      paymentMethods.razorpay += order.total
    } else if (order.payment_method === 'cod') {
      paymentMethods.cod += order.total
    }
  })

  // Calculate top items
  const itemCounts = {}
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      const itemName = item.name
      itemCounts[itemName] = (itemCounts[itemName] || 0) + item.qty
    })
  })

  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }))

  // Calculate peak hours
  const hourCounts = {}
  filteredOrders.forEach(order => {
    const hour = new Date(order.createdAt).getHours()
    const timeRange = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`
    hourCounts[timeRange] = (hourCounts[timeRange] || 0) + 1
  })

  const peakHours = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([time, orders]) => ({ time, orders }))

  const conversionRate = totalOrders > 0 ? 8.5 : 0 // Placeholder - adjust based on actual visitor data

  return {
    total_orders: totalOrders,
    total_revenue: totalRevenue,
    avg_order_value: avgOrderValue,
    conversion_rate: conversionRate,
    payment_methods: paymentMethods,
    top_items: topItems.length > 0 ? topItems : [{ name: 'No data', quantity: 0 }],
    peak_hours: peakHours.length > 0 ? peakHours : [{ time: 'No data', orders: 0 }]
  }
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify JWT token
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')

  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { timeframe = 'today' } = req.query

  // Read real orders from persistent storage
  const allData = readData('orders') || { orders: [] }
  
  // Extract orders array from new structure
  let orders = []
  if (Array.isArray(allData)) {
    orders = allData
  } else if (typeof allData === 'object' && allData.orders) {
    orders = allData.orders
  }

  // Calculate analytics from real data
  const analytics = calculateAnalytics(orders, timeframe)

  return res.status(200).json({
    success: true,
    analytics
  })
}
