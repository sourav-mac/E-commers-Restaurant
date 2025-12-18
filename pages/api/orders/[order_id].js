// pages/api/orders/[order_id].js

// Mock orders storage
const orders = {
  'PETUK-20251211-sample01': {
    order_id: 'PETUK-20251211-sample01',
    customer: { name: 'John Doe', phone: '9876543210', email: '' },
    items: [
      { item_id: 0, name: 'Chicken Lollipop', price: 180, qty: 2, itemTotal: 360 }
    ],
    subtotal: 360,
    tax: 18,
    delivery_fee: 30,
    discount: 0,
    total: 408,
    payment_method: 'razorpay',
    address: 'P4M4+M6M, Rudranagar',
    instructions: '',
    status: 'out_for_delivery',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    estimatedDeliveryTime: '15 minutes',
    statusHistory: [
      { status: 'confirmed', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { status: 'preparing', timestamp: new Date(Date.now() - 1800000).toISOString() },
      { status: 'out_for_delivery', timestamp: new Date(Date.now() - 300000).toISOString() }
    ]
  }
}

export default function handler(req, res) {
  const { order_id } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  if (!order_id || typeof order_id !== 'string') {
    return res.status(400).json({ ok: false, error: 'Order ID is required' })
  }

  const order = orders[order_id]

  if (!order) {
    return res.status(404).json({ ok: false, error: 'Order not found' })
  }

  res.status(200).json({
    ok: true,
    order: {
      ...order,
      statusLabel: getStatusLabel(order.status),
      nextStatuses: getNextStatuses(order.status)
    }
  })
}

function getStatusLabel(status) {
  const labels = {
    awaiting_payment: 'Awaiting Payment',
    confirmed: 'Order Confirmed',
    preparing: 'Preparing Your Order',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  }
  return labels[status] || status
}

function getNextStatuses(status) {
  const transitions = {
    awaiting_payment: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered'],
    delivered: [],
    cancelled: []
  }
  return transitions[status] || []
}
