// pages/api/admin/payments.js
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
}
