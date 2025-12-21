/**
 * Get Socket.IO instance from global scope
 */
export function getIO() {
  if (typeof global !== 'undefined' && global.io) {
    return global.io
  }
  return null
}

/**
 * Broadcast new order to all connected admin clients
 */
export function broadcastNewOrder(order) {
  const io = getIO()
  if (!io) {
    console.log('⚠️ Socket.IO not initialized yet')
    return
  }
  console.log('📦 [Socket.IO] Broadcasting new order:', order.order_id)
  io.to('admin').emit('orderCreated', {
    order_id: order.order_id,
    customer_name: order.customer?.name,
    customer_phone: order.customer?.phone,
    customer_email: order.customer?.email,
    total_price: order.total,
    items: order.items,
    status: order.status,
    created_at: order.createdAt,
    delivery_address: order.address
  })
}

/**
 * Broadcast new reservation to all connected admin clients
 */
export function broadcastNewReservation(reservation) {
  const io = getIO()
  if (!io) {
    console.log('⚠️ Socket.IO not initialized yet')
    return
  }
  console.log('🍽️ [Socket.IO] Broadcasting new reservation:', reservation.id)
  io.to('admin').emit('reservationCreated', {
    id: reservation.id,
    name: reservation.name,
    email: reservation.email,
    phone: reservation.phone,
    persons: reservation.size,
    date: reservation.date,
    time: reservation.time,
    special_request: reservation.note,
    status: reservation.status,
    created_at: reservation.createdAt
  })
}

/**
 * Broadcast order cancellation to all connected admin clients
 */
export function broadcastOrderCancelled(data) {
  const io = getIO()
  if (!io) {
    console.log('⚠️ Socket.IO not initialized yet')
    return
  }
  console.log('❌ [Socket.IO] Broadcasting order cancellation:', data.order_id)
  io.to('admin').emit('orderCancelled', {
    order_id: data.order_id,
    customer_name: data.customer?.name,
    customer_phone: data.customer?.phone,
    status: 'cancelled',
    cancelReason: data.cancelReason,
    cancelledAt: data.cancelledAt,
    total: data.order?.total || 0,
    payment_method: data.order?.payment_method
  })
}

/**
 * Broadcast reservation cancellation to all connected admin clients
 */
export function broadcastReservationCancelled(data) {
  const io = getIO()
  if (!io) {
    console.log('⚠️ Socket.IO not initialized yet')
    return
  }
  console.log('❌ [Socket.IO] Broadcasting reservation cancellation:', data.id)
  io.to('admin').emit('reservationCancelled', {
    id: data.id,
    name: data.name,
    phone: data.phone,
    status: 'cancelled',
    cancelReason: data.cancelReason,
    cancelledAt: data.cancelledAt,
    date: data.date,
    time: data.time,
    size: data.size
  })
}
