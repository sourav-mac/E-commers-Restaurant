// pages/api/test-sms.js
import { sendSMS, formatPhoneNumber } from '../../lib/sms'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { phone, message } = req.body

  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message are required' })
  }

  try {
    const formattedPhone = formatPhoneNumber(phone)
    const result = await sendSMS(formattedPhone, message)

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'SMS sent successfully',
        sid: result.sid,
        to: formattedPhone
      })
    } else {
      return res.status(400).json({
        success: false,
        error: result.error
      })
    }
  } catch (error) {
    console.error('Test SMS error:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
