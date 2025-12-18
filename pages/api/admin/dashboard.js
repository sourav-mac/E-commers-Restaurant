// pages/api/admin/dashboard.js
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

  // Read real orders from persistent storage
  const allData = readData('orders') || { orders: [] }
  
  // Extract orders array from new structure
  let orders = []
  if (Array.isArray(allData)) {
    orders = allData
  } else if (typeof allData === 'object' && allData.orders) {
    orders = allData.orders
  }

  // Calculate stats
  const now = new Date()
  
  // Get today's date in UTC (just the date part: YYYY-MM-DD)
  const todayUTC = now.toISOString().split('T')[0]
  
  const todayOrders = orders.filter(o => {
    // Extract just the date part from the createdAt timestamp
    const orderDateUTC = o.createdAt.split('T')[0]
    return orderDateUTC === todayUTC
  })

  // Only count paid/confirmed orders in revenue (exclude cancelled)
  const todayRevenue = todayOrders
    .filter(o => {
      // For COD: only count if delivered
      if (o.payment_method === 'cod') {
        return o.status === 'delivered'
      }
      // For Razorpay (online): count if confirmed or beyond
      if (o.payment_method === 'razorpay') {
        return ['confirmed', 'preparing', 'ready', 'delivered'].includes(o.status)
      }
      return false
    })
    .reduce((sum, o) => sum + (o.total || 0), 0)
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => ['placed', 'confirmed', 'preparing'].includes(o.status)).length

  const statusCounts = {
    placed: orders.filter(o => o.status === 'placed').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  }

  return res.status(200).json({
    success: true,
    stats: {
      todayRevenue,
      totalOrders,
      pendingOrders
    },
    statusCounts,
    recentOrders: orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    todayOrders: orders.filter(o => {
      const orderDateUTC = o.createdAt.split('T')[0]
      return orderDateUTC === todayUTC
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })
}
