// pages/api/admin/dashboard.js
import { adminApiRoute } from '../../../lib/adminProtection'
import { readData } from '../../../lib/dataStore'

export default adminApiRoute(async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Token already verified by adminApiRoute middleware
  // req.admin contains authenticated user data

  // Read real orders from persistent storage
  const allData = readData('orders') || { orders: [] }
  
  // Extract orders array from new structure
  let orders = []
  if (Array.isArray(allData)) {
    orders = allData
  } else if (typeof allData === 'object' && allData.orders) {
    orders = allData.orders
  }

  // For consistency with analytics, exclude cancelled orders from total count
  const activeOrders = orders.filter(o => o.status !== 'cancelled')

  // Calculate stats
  const now = new Date()
  
  // Get today's date in UTC (just the date part: YYYY-MM-DD)
  const todayUTC = now.toISOString().split('T')[0]
  
  const todayOrders = activeOrders.filter(o => {
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
  const totalOrders = activeOrders.length
  const pendingOrders = activeOrders.filter(o => ['placed', 'confirmed', 'preparing'].includes(o.status)).length

  const statusCounts = {
    placed: activeOrders.filter(o => o.status === 'placed').length,
    confirmed: activeOrders.filter(o => o.status === 'confirmed').length,
    preparing: activeOrders.filter(o => o.status === 'preparing').length,
    ready: activeOrders.filter(o => o.status === 'ready').length,
    delivered: activeOrders.filter(o => o.status === 'delivered').length,
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
    todayOrders: activeOrders.filter(o => {
      const orderDateUTC = o.createdAt.split('T')[0]
      return orderDateUTC === todayUTC
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })
})
