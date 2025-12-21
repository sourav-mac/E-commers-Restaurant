// pages/api/admin/orders.js
import { adminApiRoute } from '../../../../lib/adminProtection'
import { readData, writeData } from '../../../../lib/dataStore'

export default adminApiRoute(async function handler(req, res) {
  // Token already verified by adminApiRoute middleware
  // req.admin contains authenticated user data

  if (req.method === 'GET') {
    try {
      const allData = readData('orders')
      
      console.log('📊 Admin fetching orders:', {
        hasData: !!allData,
        isArray: Array.isArray(allData),
        dataKeys: typeof allData === 'object' ? Object.keys(allData || {}) : 'not-object'
      })
      
      // Handle both array format (direct orders) and object format (orders + reservations)
      let orders = []
      let reservations = []
      
      if (Array.isArray(allData)) {
        // If it's an array, it's all orders
        orders = allData
      } else if (typeof allData === 'object' && allData !== null) {
        // If it's an object, extract orders and reservations
        orders = allData.orders || (Array.isArray(allData) ? allData : [])
        reservations = allData.reservations || []
      }
      
      console.log('📊 Retrieved data:', {
        ordersCount: orders.length,
        reservationsCount: reservations.length,
        reservationStatuses: reservations.map(r => ({ id: r.id, status: r.status }))
      })
      
      return res.status(200).json({
        success: true,
        orders: Array.isArray(orders) ? orders : [],
        reservations: Array.isArray(reservations) ? reservations : []
      })
    } catch (error) {
      console.error('Error fetching orders:', error)
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch data',
        orders: [],
        reservations: []
      })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
})
