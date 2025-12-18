// pages/api/payments/verify.js
import crypto from 'crypto'
import { readData, writeData } from '../../../lib/dataStore'
import { sendSMS, formatPhoneNumber } from '../../../lib/sms'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
    return res.status(400).json({ ok: false, error: 'Missing payment verification data' })
  }

  // Verify Razorpay signature
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'hu5brmQ5qL05KXLjpS0fuEKB'
  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = crypto.createHmac('sha256', key_secret).update(body).digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ ok: false, error: 'Invalid payment signature' })
  }

  try {
    // Signature verified! Update order status in dataStore
    const allData = readData('orders') || { orders: [] }
    
    // Extract orders array from new structure
    let orders = []
    if (Array.isArray(allData)) {
      orders = allData
    } else if (typeof allData === 'object' && allData.orders) {
      orders = allData.orders
    }
    
    const orderIndex = orders.findIndex(o => o.order_id === order_id)

    if (orderIndex === -1) {
      return res.status(404).json({ ok: false, error: 'Order not found' })
    }

    const order = orders[orderIndex]

    // Update order with payment confirmation
    orders[orderIndex].razorpay_order_id = razorpay_order_id
    orders[orderIndex].razorpay_payment_id = razorpay_payment_id
    orders[orderIndex].razorpay_signature = razorpay_signature
    
    // Write back to file (preserve structure)
    if (Array.isArray(allData)) {
      writeData('orders', orders)
    } else {
      allData.orders = orders
      writeData('orders', allData)
    }

    // Send SMS notifications (non-blocking)
    const customerPhone = formatPhoneNumber(order.customer?.phone)
    const adminPhone = process.env.ADMIN_PHONE

    console.log('SMS Debug:', {
      customerPhone,
      adminPhone,
      customerName: order.customer?.name,
      orderTotal: order.total
    })

    let customerSmsResult = { sent: false }
    let adminSmsResult = { sent: false }

    if (customerPhone) {
      const customerMessage = `✅ Petuk Order Confirmed!
Order ID: ${order.order_id}
Amount: ₹${order.total}
We are preparing your food 🍽
Thank you for ordering!`
      console.log('Sending customer SMS to:', customerPhone)
      try {
        customerSmsResult = await sendSMS(customerPhone, customerMessage)
        console.log('Customer SMS result:', customerSmsResult)
      } catch (err) {
        console.error('Customer SMS failed:', err.message)
      }
    } else {
      console.warn('No valid customer phone number found')
    }

    if (adminPhone) {
      const adminMessage = `🔔 NEW ORDER RECEIVED
Order ID: ${order.order_id}
Customer: ${order.customer?.name}
Phone: ${order.customer?.phone}
Amount: ₹${order.total}
Items: ${order.items?.length || 0}`
      console.log('Sending admin SMS to:', adminPhone)
      try {
        adminSmsResult = await sendSMS(adminPhone, adminMessage)
        console.log('Admin SMS result:', adminSmsResult)
      } catch (err) {
        console.error('Admin SMS failed:', err.message)
      }
    }

    res.status(200).json({
      ok: true,
      message: 'Payment verified successfully',
      order_id,
      status: 'placed',
      sms: {
        customerPhone: customerPhone || null,
        customerSmsSent: customerSmsResult.success || false,
        adminSmsSent: adminSmsResult.success || false
      }
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    res.status(500).json({ ok: false, error: 'Failed to verify payment' })
  }
}
