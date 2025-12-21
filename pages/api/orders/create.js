// pages/api/orders/create.js
import { v4 as uuidv4 } from 'uuid'
import Razorpay from 'razorpay'
import menu from '../../../data/menu.json'
import { readData, writeData } from '../../../lib/dataStore'
import { sendSMS, formatPhoneNumber } from '../../../lib/sms'
import { broadcastEvent } from '../../../lib/sse'
import { broadcastNewOrder } from '../../../lib/socketServer'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RrcPAcvB65TfFu',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'hu5brmQ5qL05KXLjpS0fuEKB'
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  const { customer, items, payment_method, address, instructions, promo_discount } = req.body

  // Validate customer info
  if (!customer || !customer.name || !customer.phone) {
    return res.status(400).json({ ok: false, error: 'Customer name and phone required' })
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ ok: false, error: 'Cart is empty' })
  }

  // Validate payment method
  if (!['razorpay', 'cod'].includes(payment_method)) {
    return res.status(400).json({ ok: false, error: 'Invalid payment method' })
  }

  // Validate items and compute totals server-side (NEVER trust client totals)
  let subtotal = 0
  const validatedItems = []

  for (const cartItem of items) {
    const { item_id, qty } = cartItem
    const menuItem = menu.items[item_id]

    if (!menuItem) {
      return res.status(400).json({ ok: false, error: `Item ${item_id} not found` })
    }

    if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
      return res.status(400).json({ ok: false, error: `Invalid quantity` })
    }

    const itemTotal = menuItem.price * qty
    subtotal += itemTotal

    validatedItems.push({
      item_id,
      name: menuItem.name,
      price: menuItem.price,
      qty,
      itemTotal
    })
  }

  const tax = Math.round(subtotal * 0.05 * 100) / 100 // 5% tax
  const delivery_fee = 30
  const discount = promo_discount || 0
  const total = subtotal + tax + delivery_fee - discount

  // Generate order ID
  const order_id = `PETUK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${uuidv4().slice(0, 8)}`

  // Create order object
  const order = {
    order_id,
    customer,
    items: validatedItems,
    subtotal,
    tax,
    delivery_fee,
    discount,
    total,
    payment_method,
    address: address || 'Pickup',
    instructions,
    status: 'placed',
    createdAt: new Date().toISOString(),
    razorpay_order_id: null,
    razorpay_payment_id: null,
    razorpay_signature: null
  }

  // For Razorpay, create an order in Razorpay and store razorpay_order_id
  if (payment_method === 'razorpay') {
    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(total * 100), // Amount in paise
        currency: 'INR',
        receipt: order_id,
        payment_capture: 1
      })

      order.razorpay_order_id = razorpayOrder.id

      // Store order in persistent storage
      const allData = readData('orders') || { orders: [] }
      let allOrders = []
      if (Array.isArray(allData)) {
        allOrders = allData
      } else if (typeof allData === 'object' && allData.orders) {
        allOrders = allData.orders
      }
      allOrders.push(order)
      if (Array.isArray(allData)) {
        writeData('orders', allOrders)
      } else {
        allData.orders = allOrders
        writeData('orders', allData)
      }

      // Broadcast to SSE listeners
      try {
        console.log('📡 Broadcasting new-order event:', order.order_id)
        broadcastEvent('new-order', order)
      } catch (err) {
        console.error('❌ SSE broadcast failed:', err)
      }

      // Broadcast via Socket.IO
      try {
        broadcastNewOrder(order)
      } catch (err) {
        console.error('❌ Socket.IO broadcast failed:', err)
      }

      return res.status(200).json({
        ok: true,
        order_id,
        razorpay_order_id: razorpayOrder.id,
        amount: Math.round(total * 100), // in paise
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email || ''
      })
    } catch (err) {
      console.error('Razorpay order creation error:', err.message, err.response?.data)
      return res.status(500).json({ 
        ok: false, 
        error: 'Failed to create payment order: ' + (err.message || 'Unknown error'),
        details: err.response?.data
      })
    }
  }

  // COD: Order placed, requires admin confirmation
  const allData = readData('orders') || { orders: [] }
  let allOrders = []
  if (Array.isArray(allData)) {
    allOrders = allData
  } else if (typeof allData === 'object' && allData.orders) {
    allOrders = allData.orders
  }
  allOrders.push(order)
  if (Array.isArray(allData)) {
    writeData('orders', allOrders)
  } else {
    allData.orders = allOrders
    writeData('orders', allData)
  }

  // Send SMS notification to admin for COD orders
  const adminPhone = process.env.ADMIN_PHONE
  if (adminPhone) {
    const adminMessage = `🔔 NEW COD ORDER RECEIVED
Order ID: ${order.order_id}
Customer: ${customer.name}
Phone: ${customer.phone}
Amount: ₹${total}
Items: ${validatedItems.length}`
    sendSMS(adminPhone, adminMessage).catch(err =>
      console.error('Admin SMS failed:', err)
    )
  }

  // Broadcast event to SSE listeners so admins get real-time updates
  try {
    console.log('📡 Broadcasting new-order event:', order.order_id)
    broadcastEvent('new-order', order)
  } catch (err) {
    console.error('❌ SSE broadcast failed:', err)
  }

  // Broadcast via Socket.IO
  try {
    broadcastNewOrder(order)
  } catch (err) {
    console.error('❌ Socket.IO broadcast failed:', err)
  }

  res.status(200).json({
    ok: true,
    order_id,
    total,
    status: 'placed',
    customer_name: customer.name,
    customer_phone: customer.phone,
    message: 'Order placed. Waiting for admin confirmation.'
  })
}
