import { readData, writeData } from '../../lib/dataStore'
import { sendSMS, formatPhoneNumber } from '../../lib/sms'
import { v4 as uuidv4 } from 'uuid'
import { broadcastEvent } from '../../lib/sse'
import { broadcastNewReservation } from '../../lib/socketServer'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, phone, date, time, size, note } = req.body;

    // Validation
    if (!name || !phone || !date || !time || !size) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
      // Format phone number
      const formattedPhone = formatPhoneNumber(phone);

      // Create reservation object
      const reservation = {
        id: uuidv4().slice(0, 8),
        name,
        phone: formattedPhone,
        originalPhone: phone,
        date,
        time,
        size,
        note: note || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('📝 New reservation object:', { id: reservation.id, phone: reservation.phone, originalPhone: reservation.originalPhone, status: reservation.status })

      // Read existing reservations
      const existingData = readData('orders') || { orders: [] };
      if (!existingData.reservations) {
        existingData.reservations = [];
      }
      existingData.reservations.push(reservation);

      console.log('💾 Saving reservation, total reservations now:', existingData.reservations.length)

      // Write back to file
      writeData('orders', existingData);

      // Broadcast via Socket.IO (for real-time admin notification)
      try {
        broadcastNewReservation(reservation)
      } catch (err) {
        console.error('❌ Socket.IO broadcast failed:', err)
      }

      // Send SMS asynchronously (don't await - improves response time)
      const customerMessage = `📩 Reservation request received!
Reservation ID: ${reservation.id}
Name: ${name}
Date: ${date}
Time: ${time}
Party Size: ${size}
Status: Pending - we will call to confirm. Thank you!`;

      // Fire-and-forget SMS to customer
      sendSMS(formattedPhone, customerMessage).catch(err => {
        console.error('❌ Failed to send customer SMS:', err)
      });

      // Fire-and-forget SMS to admin
      const adminMessage = `🔔 NEW RESERVATION REQUEST!
ID: ${reservation.id}
Name: ${name}
Phone: ${formattedPhone}
Date: ${date}
Time: ${time}
Party Size: ${size}
Special Requests: ${note || 'None'}`;

      const adminPhone = process.env.ADMIN_PHONE;
      if (adminPhone) {
        sendSMS(adminPhone, adminMessage).catch(err => {
          console.error('❌ Failed to send admin SMS:', err)
        });
      }

      console.log('✅ Reservation created:', reservation.id);

      // Broadcast event to SSE listeners (fire-and-forget)
      try {
        broadcastEvent('new-reservation', reservation)
      } catch (err) {
        console.error('❌ SSE broadcast failed:', err)
      }

      // Return immediately - SMS and broadcasts happen in background
      res.status(200).json({
        success: true,
        message: 'Your table is booked. We will call to confirm.',
        reservation
      });
    } catch (error) {
      console.error('❌ Reservation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing reservation. Please try again.'
      });
    }
  } else {
    res.status(405).end();
  }
}
