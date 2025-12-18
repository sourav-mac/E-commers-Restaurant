import { readData, writeData } from '../../lib/dataStore'
import { sendSMS, formatPhoneNumber } from '../../lib/sms'
import { v4 as uuidv4 } from 'uuid'
import { broadcastEvent } from '../../lib/sse'

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

      // Send SMS to customer (note: status is pending until admin accepts)
      const customerMessage = `📩 Reservation request received!
Reservation ID: ${reservation.id}
Name: ${name}
Date: ${date}
Time: ${time}
Party Size: ${size}
Status: Pending - we will call to confirm. Thank you!`;


      await sendSMS(formattedPhone, customerMessage);

      // Send SMS to admin
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
        await sendSMS(adminPhone, adminMessage);
      }

      console.log('✅ Reservation created:', reservation.id);

      // Broadcast event to SSE listeners so admins get real-time updates
      try {
        console.log('📡 Broadcasting new-reservation event:', reservation.id)
        broadcastEvent('new-reservation', reservation)
      } catch (err) {
        console.error('❌ SSE broadcast failed:', err)
      }

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
