/**
 * Secure Cancel Reservation API
 * Protected: Requires JWT authentication
 * 
 * Verifies user owns the reservation before allowing cancellation
 * Prevents users from cancelling other users' reservations
 */

import { authMiddleware } from '../../../../lib/authMiddleware.js'
import { readData, writeData } from '../../../../lib/dataStore'
import { sendSMS, formatPhoneNumber } from '../../../../lib/sms'
import { broadcastEvent } from '../../../../lib/sse'
import { broadcastReservationCancelled } from '../../../../lib/socketServer'

export default authMiddleware(async (req, res, user) => {
  const { reservation_id } = req.query

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!reservation_id) {
    return res.status(400).json({ error: 'Reservation ID is required' })
  }

  try {
    const { reason } = req.body

    if (!reason) {
      return res.status(400).json({ error: 'Cancellation reason is required' })
    }

    console.log(`🔐 [CANCEL] User ${user.phone} attempting to cancel reservation ${reservation_id}`)

    // Read orders data (which contains reservations)
    const allData = readData('orders') || { orders: [], reservations: [] }
    const reservations = allData.reservations || []

    // Find the reservation
    const reservationIndex = reservations.findIndex(r => r.id === reservation_id)

    if (reservationIndex === -1) {
      console.log(`❌ [CANCEL] Reservation not found: ${reservation_id}`)
      return res.status(404).json({ error: 'Reservation not found' })
    }

    const reservation = reservations[reservationIndex]

    // 🔒 SECURITY CHECK: Verify user owns this reservation
    const resPhone = (reservation.phone || reservation.originalPhone || '').toString().trim().replace(/[\s\-\(\)]/g, '')
    const userPhoneNorm = String(user.phone || '').trim().replace(/[\s\-\(\)]/g, '')
    
    // Compare last 10 digits (normalized phone format)
    const resPhoneNorm = resPhone.slice(-10)
    const userPhoneLastDigits = userPhoneNorm.slice(-10)

    if (resPhoneNorm !== userPhoneLastDigits) {
      console.error(`🚨 [SECURITY] UNAUTHORIZED ATTEMPT: User ${user.phone} tried to cancel reservation ${reservation_id} belonging to ${resPhoneNorm}`)
      return res.status(403).json({ 
        error: 'Unauthorized: This reservation does not belong to you',
        message: 'You cannot cancel someone else\'s reservation'
      })
    }

    console.log(`✅ [SECURITY] Ownership verified for user ${user.phone}`)

    // Check if reservation can be cancelled
    const cancellableStatuses = ['pending', 'accepted']
    if (!cancellableStatuses.includes(reservation.status)) {
      return res.status(400).json({
        error: `Cannot cancel reservation with status: ${reservation.status}`,
        currentStatus: reservation.status
      })
    }

    // Check if already cancelled
    if (reservation.status === 'cancelled') {
      return res.status(400).json({ error: 'Reservation is already cancelled' })
    }

    // Update reservation status
    reservations[reservationIndex].status = 'cancelled'
    reservations[reservationIndex].cancelledAt = new Date().toISOString()
    reservations[reservationIndex].cancelReason = reason
    reservations[reservationIndex].cancelledByCustomer = true

    // Save to persistent storage
    allData.reservations = reservations
    writeData('orders', allData)

    const updatedReservation = reservations[reservationIndex]

    // 📱 Notify customer via SMS
    const customerPhone = formatPhoneNumber(reservation.phone || reservation.originalPhone)
    if (customerPhone) {
      const smsMessage = `✅ Petuk Reservation Cancelled
Reservation ID: ${reservation.id}
Your table reservation has been successfully cancelled.
Date: ${reservation.date}
Time: ${reservation.time}
Party Size: ${reservation.size} ${parseInt(reservation.size) === 1 ? 'person' : 'people'}
Thank you for using Petuk!`

      console.log(`📱 Sending cancellation SMS to customer: ${customerPhone}`)
      sendSMS(customerPhone, smsMessage).catch(err =>
        console.error('❌ Customer cancellation SMS failed:', err)
      )
    }

    // 🔔 Notify admin via SMS
    const adminPhone = process.env.ADMIN_PHONE
    if (adminPhone) {
      const adminSmsMessage = `🚨 RESERVATION CANCELLED BY CUSTOMER
Reservation ID: ${reservation.id}
Customer: ${reservation.name}
Phone: ${reservation.phone || reservation.originalPhone}
Date: ${reservation.date}
Time: ${reservation.time}
Party Size: ${reservation.size} ${parseInt(reservation.size) === 1 ? 'person' : 'people'}
Reason: ${reason}
Cancelled At: ${new Date().toLocaleString()}`

      console.log(`📱 Sending cancellation alert SMS to admin: ${adminPhone}`)
      sendSMS(adminPhone, adminSmsMessage).catch(err =>
        console.error('❌ Admin cancellation SMS failed:', err)
      )
    }

    // 📡 Broadcast to SSE listeners (for admin real-time updates)
    try {
      console.log('📡 Broadcasting reservation-cancelled event:', reservation.id)
      broadcastEvent('reservation-cancelled', {
        id: reservation.id,
        status: 'cancelled',
        cancelledAt: updatedReservation.cancelledAt,
        cancelReason: reason,
        customer: {
          name: reservation.name,
          phone: reservation.phone || reservation.originalPhone
        }
      })
    } catch (err) {
      console.error('❌ SSE broadcast failed:', err)
    }

    // 🔌 Broadcast via Socket.IO (for real-time admin dashboard)
    try {
      broadcastReservationCancelled({
        id: reservation.id,
        status: 'cancelled',
        cancelledAt: updatedReservation.cancelledAt,
        cancelReason: reason,
        name: reservation.name,
        phone: reservation.phone || reservation.originalPhone,
        date: reservation.date,
        time: reservation.time,
        size: reservation.size,
        reservation: updatedReservation
      })
    } catch (err) {
      console.error('❌ Socket.IO broadcast failed:', err)
    }

    return res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully',
      reservation: updatedReservation
    })
  } catch (err) {
    console.error('❌ Reservation cancellation error:', err)
    return res.status(500).json({
      error: 'Failed to cancel reservation',
      details: err.message
    })
  }
})
