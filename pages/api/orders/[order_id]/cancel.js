/**
 * Secure Cancel Order API
 * Protected: Requires JWT authentication
 * 
 * Verifies user owns the order before allowing cancellation
 * Prevents users from cancelling other users' orders
 */

import { authMiddleware } from '../../../../lib/authMiddleware.js'
import { readData, writeData } from '../../../../lib/dataStore'
import { sendSMS, formatPhoneNumber } from '../../../../lib/sms'
import { broadcastEvent } from '../../../../lib/sse'
import { broadcastOrderCancelled } from '../../../../lib/socketServer'

export default authMiddleware(async (req, res, user) => {
  const { order_id } = req.query

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!order_id) {
    return res.status(400).json({ error: 'Order ID is required' })
  }

  try {
    const { reason } = req.body

    if (!reason) {
      return res.status(400).json({ error: 'Cancellation reason is required' })
    }

    console.log(`🔐 [CANCEL] User ${user.phone} attempting to cancel order ${order_id}`)

    // Read orders from persistent storage
    const allData = readData('orders') || { orders: [] }
    let orders = []
    if (Array.isArray(allData)) {
      orders = allData
    } else if (typeof allData === 'object' && allData.orders) {
      orders = allData.orders
    }

    // Find the order
    const orderIndex = orders.findIndex(o => o.order_id === order_id)

    if (orderIndex === -1) {
      console.log(`❌ [CANCEL] Order not found: ${order_id}`)
      return res.status(404).json({ error: 'Order not found' })
    }

    const order = orders[orderIndex]

    // 🔒 SECURITY CHECK: Verify user owns this order
    const orderPhone = (order.customer?.phone || order.phone || '').toString().trim().replace(/[\s\-\(\)]/g, '')
    const userPhoneNorm = String(user.phone || '').trim().replace(/[\s\-\(\)]/g, '')
    
    // Compare last 10 digits (normalized phone format)
    const orderPhoneNorm = orderPhone.slice(-10)
    const userPhoneLastDigits = userPhoneNorm.slice(-10)

    
    if (orderPhoneLastDigits !== userPhoneLastDigits) {
      console.error(`🚨 [SECURITY] UNAUTHORIZED ATTEMPT: User ${user.phone} tried to cancel order ${order_id} belonging to ${orderPhoneNorm}`)
      return res.status(403).json({ 
        error: 'Unauthorized: This order does not belong to you',
        message: 'You cannot cancel someone else\'s order'
      })
    }

    console.log(`✅ [SECURITY] Ownership verified for user ${user.phone}`)

    // Check if order can be cancelled
    const cancellableStatuses = ['placed', 'confirmed', 'ready']
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        error: `Cannot cancel order with status: ${order.status}`,
        currentStatus: order.status
      })
    }

    // Check if already cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Order is already cancelled' })
    }

    // Update order status
    orders[orderIndex].status = 'cancelled'
    orders[orderIndex].cancelledAt = new Date().toISOString()
    orders[orderIndex].cancelReason = reason
    orders[orderIndex].cancelledByCustomer = true

    // Save to persistent storage
    if (Array.isArray(allData)) {
      writeData('orders', orders)
    } else {
      allData.orders = orders
      writeData('orders', allData)
    }

    const updatedOrder = orders[orderIndex]

    // 📱 Notify customer via SMS
    const customerPhone = formatPhoneNumber(order.customer?.phone)
    if (customerPhone) {
      const smsMessage = `✅ Petuk Order Cancelled
Order ID: ${order.order_id}
Your order has been successfully cancelled.
Amount: ₹${order.total}
${order.payment_method === 'razorpay' ? 'Refund will be processed in 3-5 business days.' : ''}
Thank you for using Petuk!`

      console.log(`📱 Sending cancellation SMS to customer: ${customerPhone}`)
      sendSMS(customerPhone, smsMessage).catch(err =>
        console.error('❌ Customer cancellation SMS failed:', err)
      )
    }

    // 🔔 Notify admin via SMS
    const adminPhone = process.env.ADMIN_PHONE
    if (adminPhone) {
      const adminSmsMessage = `🚨 ORDER CANCELLED BY CUSTOMER
Order ID: ${order.order_id}
Customer: ${order.customer?.name}
Phone: ${order.customer?.phone}
Amount: ₹${order.total}
Reason: ${reason}
Payment: ${order.payment_method === 'razorpay' ? 'Online' : 'COD'}
Status Before: placed
Cancelled At: ${new Date().toLocaleString()}`

      console.log(`📱 Sending cancellation alert SMS to admin: ${adminPhone}`)
      sendSMS(adminPhone, adminSmsMessage).catch(err =>
        console.error('❌ Admin cancellation SMS failed:', err)
      )
    }

    // 📡 Broadcast to SSE listeners (for admin real-time updates)
    try {
      console.log('📡 Broadcasting order-cancelled event:', order.order_id)
      broadcastEvent('order-cancelled', {
        order_id: order.order_id,
        status: 'cancelled',
        cancelledAt: updatedOrder.cancelledAt,
        cancelReason: reason,
        customer: order.customer
      })
    } catch (err) {
      console.error('❌ SSE broadcast failed:', err)
    }

    // 🔌 Broadcast via Socket.IO (for real-time admin dashboard)
    try {
      broadcastOrderCancelled({
        order_id: order.order_id,
        status: 'cancelled',
        cancelledAt: updatedOrder.cancelledAt,
        cancelReason: reason,
        customer: order.customer,
        order: updatedOrder
      })
    } catch (err) {
      console.error('❌ Socket.IO broadcast failed:', err)
    }

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: updatedOrder
    })
  } catch (err) {
    console.error('❌ Order cancellation error:', err)
    return res.status(500).json({
      error: 'Failed to cancel order',
      details: err.message
    })
  }
})
