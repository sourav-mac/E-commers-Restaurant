/**
 * Toast Helper Utility
 * Provides reusable functions to trigger toast notifications
 */

/**
 * Show order toast notification
 * @param {Object} order - Order object
 * @param {string} order.order_id - Order ID
 * @param {string} order.customer_name - Customer name
 * @param {number} order.total - Order total amount
 * @param {string} order.created_at - Order creation timestamp
 */
export const showOrderToast = (order) => {
  console.log('📦 [TOAST HELPER] Triggering order toast:', order.order_id)
  // This is handled by NotificationContext's showNotification()
  // Just log for now - called from real-time events
}

/**
 * Show reservation toast notification
 * @param {Object} reservation - Reservation object
 * @param {string} reservation.id - Reservation ID
 * @param {string} reservation.name - Customer name
 * @param {number} reservation.num_people - Number of people
 * @param {string} reservation.time - Reservation time
 * @param {string} reservation.created_at - Reservation creation timestamp
 */
export const showReservationToast = (reservation) => {
  console.log('🍽️ [TOAST HELPER] Triggering reservation toast:', reservation.id)
  // This is handled by NotificationContext's showNotification()
  // Just log for now - called from real-time events
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount with ₹ symbol
 */
export const formatCurrency = (amount) => {
  if (!amount) return '₹0'
  return `₹${amount.toLocaleString('en-IN')}`
}

/**
 * Format time for display
 * @param {string|Date} dateTime - Date/time to format
 * @returns {string} Formatted time string
 */
export const formatTime = (dateTime) => {
  if (!dateTime) return new Date().toLocaleTimeString('en-IN')
  return new Date(dateTime).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * Format full timestamp for display
 * @param {string|Date} dateTime - Date/time to format
 * @returns {string} Formatted full datetime string
 */
export const formatFullDateTime = (dateTime) => {
  if (!dateTime) return new Date().toLocaleString('en-IN')
  return new Date(dateTime).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get toast icon based on type
 * @param {string} type - Toast type ('order' or 'reservation')
 * @returns {string} Emoji icon
 */
export const getToastIcon = (type) => {
  return type === 'order' ? '🔥' : '📅'
}

/**
 * Get toast title based on type
 * @param {string} type - Toast type ('order' or 'reservation')
 * @returns {string} Toast title
 */
export const getToastTitle = (type) => {
  return type === 'order' ? 'New Order Received!' : 'New Reservation!'
}

/**
 * Get toast color classes based on type
 * @param {string} type - Toast type ('order' or 'reservation')
 * @returns {Object} Color classes
 */
export const getToastColors = (type) => {
  return type === 'order'
    ? {
        bg: 'from-orange-950/40 to-orange-900/20',
        border: 'border-orange-500/60',
        text: 'text-orange-400',
        glow: 'toast-glow'
      }
    : {
        bg: 'from-blue-950/40 to-blue-900/20',
        border: 'border-blue-500/60',
        text: 'text-blue-400',
        glow: 'toast-glow-blue'
      }
}
