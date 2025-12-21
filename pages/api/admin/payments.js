// pages/api/admin/payments.js
import { adminApiRoute } from '../../../lib/adminProtection'
import { readData } from '../../../lib/dataStore'

export default adminApiRoute(async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Token already verified by adminApiRoute middleware
  // req.admin contains authenticated user data

  // Read real orders from persistent storage and extract payment info
  const allData = readData('orders') || { orders: [] }
  
  // Extract orders array from new structure
  let orders = []
  if (Array.isArray(allData)) {
    orders = allData
  } else if (typeof allData === 'object' && allData.orders) {
    orders = allData.orders
  }
  
  const payments = orders
    .filter(order => order.status !== 'cancelled') // Exclude cancelled orders
    .map((order, index) => {
      let paymentStatus = 'pending'
      
      // For Razorpay: captured if order is confirmed or beyond
      if (order.payment_method === 'razorpay') {
        if (['confirmed', 'preparing', 'ready', 'delivered'].includes(order.status)) {
          paymentStatus = 'captured'
        } else {
          paymentStatus = 'pending'
        }
      }
      // For COD: captured if order is delivered
      else if (order.payment_method === 'cod') {
        if (order.status === 'delivered') {
          paymentStatus = 'captured'
        } else {
          paymentStatus = 'pending'
        }
      }
      
      return {
        _id: `pay_${index + 1}`,
        order_id: order.order_id,
        customer_name: order.customer.name,
        amount: order.total,
        method: order.payment_method,
        status: paymentStatus,
        order_status: order.status,
        payment_id: order.razorpay_payment_id || null,
        razorpay_payment_id: order.razorpay_payment_id || null,
        razorpay_order_id: order.razorpay_order_id || null,
        created_at: order.createdAt
      }
    })

  return res.status(200).json({
    success: true,
    payments: payments
  })
})
