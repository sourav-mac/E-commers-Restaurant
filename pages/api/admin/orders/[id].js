// pages/api/admin/orders/[id].js
import jwt from 'jsonwebtoken'
import { readData, writeData } from '../../../../lib/dataStore'
import { sendSMS, formatPhoneNumber } from '../../../../lib/sms'

const JWT_SECRET = 'petuk-admin-secret-key-2024'

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

const statusMessages = {
  confirmed: {
    emoji: '✅',
    text: 'confirmed! Our team is preparing your order.'
  },
  preparing: {
    emoji: '👨‍🍳',
    text: 'being prepared in our kitchen.'
  },
  ready: {
    emoji: '📦',
    text: 'ready for pickup/delivery!'
  },
  delivered: {
    emoji: '🚚',
    text: 'delivered! We hope you enjoyed your meal 😊'
  },
  cancelled: {
    emoji: '❌',
    text: 'cancelled. Please contact us for more details.'
  }
}

export default function handler(req, res) {
  const { id } = req.query

  // Verify JWT token
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')

  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    const allData = readData('orders') || { orders: [] }
    let orders = []
    if (Array.isArray(allData)) {
      orders = allData
    } else if (typeof allData === 'object' && allData.orders) {
      orders = allData.orders
    }
    const order = orders.find(o => o.order_id === id)
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    return res.status(200).json({ success: true, order })
  }

  if (req.method === 'PATCH') {
    const { status, internalNotes } = req.body
    const allData = readData('orders') || { orders: [] }
    let orders = []
    if (Array.isArray(allData)) {
      orders = allData
    } else if (typeof allData === 'object' && allData.orders) {
      orders = allData.orders
    }
    const orderIndex = orders.findIndex(o => o.order_id === id)

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const order = orders[orderIndex]
    const previousStatus = order.status

    if (status) {
      orders[orderIndex].status = status
    }
    if (internalNotes !== undefined) {
      orders[orderIndex].internalNotes = internalNotes
    }

    // Update payment_status based on payment method and order status
    if (orders[orderIndex].payment_method === 'razorpay') {
      // For online payments, mark as paid when confirmed
      if (status === 'confirmed') {
        orders[orderIndex].payment_status = 'paid'
      }
    } else if (orders[orderIndex].payment_method === 'cod') {
      // For COD, mark as paid when delivered
      if (status === 'delivered') {
        orders[orderIndex].payment_status = 'paid'
      }
    }

    writeData('orders', Array.isArray(allData) ? orders : (allData.orders = orders, allData))

    // Send SMS notification to customer
    const customerPhone = formatPhoneNumber(order.customer?.phone)
    if (customerPhone) {
      const statusInfo = statusMessages[status]
      if (statusInfo) {
        const customerMessage = `${statusInfo.emoji} Petuk Order Update!
Order ID: ${order.order_id}
Your order is ${statusInfo.text}
Amount: ₹${order.total}
Thank you!`
        
        console.log(`📱 Sending status update SMS to ${customerPhone} for order ${order.order_id}`)
        sendSMS(customerPhone, customerMessage).catch(err =>
          console.error('Customer status update SMS failed:', err)
        )
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Order updated',
      order: orders[orderIndex],
      smsNotified: !!customerPhone
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
