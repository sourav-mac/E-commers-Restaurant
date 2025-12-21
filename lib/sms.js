// lib/sms.js
const twilio = require('twilio')

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID
const twilioPhone = process.env.TWILIO_PHONE

console.log('Twilio Config:', {
  accountSid: accountSid ? '✓ Set' : '✗ Missing',
  authToken: authToken ? '✓ Set' : '✗ Missing',
  messagingServiceSid: messagingServiceSid ? '✓ Set' : '✗ Missing',
  twilioPhone: twilioPhone ? '✓ Set' : '✗ Missing'
})

const client = twilio(accountSid, authToken)

async function sendSMS(to, message) {
  try {
    console.log('📱 Attempting to send SMS:', {
      to,
      messageLength: message.length,
      method: messagingServiceSid ? 'Messaging Service' : 'Direct'
    })

    let result
    
    // Try using Messaging Service first (preferred)
    if (messagingServiceSid) {
      try {
        result = await client.messages.create({
          body: message,
          messagingServiceSid: messagingServiceSid,
          to: to
        })
        console.log(`✅ SMS sent via Messaging Service to ${to}: ${result.sid}`)
        return { success: true, sid: result.sid, method: 'messagingService' }
      } catch (err) {
        console.warn('⚠️ Messaging Service failed, trying direct phone:', err.message)
      }
    }

    // Fallback to direct phone number
    if (twilioPhone) {
      result = await client.messages.create({
        body: message,
        from: twilioPhone,
        to: to
      })
      console.log(`✅ SMS sent via Direct Phone to ${to}: ${result.sid}`)
      return { success: true, sid: result.sid, method: 'directPhone' }
    }

    throw new Error('No valid Twilio sending method configured')
  } catch (error) {
    console.error(`❌ SMS failed to ${to}:`, {
      message: error.message,
      code: error.code,
      status: error.status
    })
    return { success: false, error: error.message }
  }
}

export function formatPhoneNumber(phone) {
  // Ensure phone number has +91 prefix for India
  if (!phone) return null
  phone = phone.toString().trim().replace(/[\s\-\(\)]/g, '')
  
  console.log('📞 Formatting phone number:', { original: phone, length: phone.length })
  
  if (phone.length === 10) {
    const formatted = `+91${phone}`
    console.log('✓ Formatted 10-digit number:', formatted)
    return formatted
  }
  if (phone.startsWith('0') && phone.length === 11) {
    const formatted = `+91${phone.substring(1)}`
    console.log('✓ Formatted 11-digit number with 0:', formatted)
    return formatted
  }
  if (!phone.startsWith('+')) {
    const formatted = `+${phone}`
    console.log('✓ Added + prefix:', formatted)
    return formatted
  }
  console.log('✓ Phone already formatted:', phone)
  return phone
}

export { sendSMS }
