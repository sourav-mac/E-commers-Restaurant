import jwt from 'jsonwebtoken'
import { readData, writeData } from '../../../../lib/dataStore'
import { sendSMS } from '../../../../lib/sms'

const JWT_SECRET = 'petuk-admin-secret-key-2024'

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

export default async function handler(req, res) {
  // Verify JWT token
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')

  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { id } = req.query
  const { status } = req.body

  if (req.method === 'PATCH') {
    try {
      console.log('🔁 Reservation update request:', { id, body: req.body })
      // Validate status
      if (!['accepted', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' })
      }

      // Read data
      const allData = readData('orders') || {}
      
      // Handle both array and object formats
      let reservations = []
      if (typeof allData === 'object' && !Array.isArray(allData)) {
        reservations = allData.reservations || []
      }

      // Find reservation
      const reservationIndex = reservations.findIndex(r => r.id === id)
      if (reservationIndex === -1) {
        return res.status(404).json({ error: 'Reservation not found' })
      }

      const reservation = reservations[reservationIndex]

      // Update status
      reservation.status = status
      reservation.updatedAt = new Date().toISOString()

      // Update in data
      reservations[reservationIndex] = reservation
      
      // Ensure we maintain the correct data structure
      if (!allData.reservations) {
        allData.reservations = []
      }
      allData.reservations = reservations
      
      writeData('orders', allData)

      // Send SMS to customer
      const phone = reservation.phone || reservation.originalPhone
      const adminPhone = process.env.ADMIN_PHONE || 'the restaurant'
      const statusMessages = {
        accepted: `✅ Your Petuk reservation has been CONFIRMED!\nReservation ID: ${reservation.id}\nDate: ${reservation.date}\nTime: ${reservation.time}\nParty Size: ${reservation.size}\nWe look forward to serving you!`,
        cancelled: `❌ Your Petuk reservation (ID: ${reservation.id}) for ${reservation.date} at ${reservation.time} has been CANCELLED.\nPlease contact us for more information.\nPhone: ${adminPhone}`
      }

      const message = statusMessages[status]
      if (phone) {
        await sendSMS(phone, message)
        console.log(`✅ Reservation ${id} ${status}, SMS sent to ${phone}`)
      }

      res.status(200).json({
        success: true,
        message: `Reservation ${status}`,
        reservation,
        smsNotified: !!phone
      })
    } catch (error) {
      console.error('❌ Reservation update error:', error)
      res.status(500).json({ error: 'Failed to update reservation' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
