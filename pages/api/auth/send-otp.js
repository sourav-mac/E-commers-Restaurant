/**
 * API: Send OTP for user authentication
 * POST /api/auth/send-otp
 */

const fs = require('fs')
const path = require('path')

// Inline OTP logic
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function storeOTP(phone) {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    const otpsFile = path.join(dataDir, 'otps.json')
    let data = { otps: {} }
    
    if (fs.existsSync(otpsFile)) {
      data = JSON.parse(fs.readFileSync(otpsFile, 'utf8'))
    }
    
    if (!data.otps) data.otps = {}
    
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10)
    const otp = generateOTP()
    
    data.otps[normalizedPhone] = {
      otp: otp,
      createdAt: new Date().toISOString(),
      attempts: 0
    }
    
    fs.writeFileSync(otpsFile, JSON.stringify(data, null, 2))
    
    return {
      success: true,
      message: 'OTP generated successfully',
      otp: otp
    }
  } catch (err) {
    console.error('❌ [OTP] Error storing OTP:', err)
    return {
      success: false,
      message: 'Failed to generate OTP'
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed. Use POST.'
    })
  }

  try {
    const { phone } = req.body

    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({
        error: 'Invalid request. Phone number is required.',
        success: false
      })
    }

    const normalizedPhone = phone.replace(/\D/g, '').slice(-10)
    if (normalizedPhone.length !== 10) {
      return res.status(400).json({
        error: 'Invalid phone number. Please enter a valid phone number.',
        success: false
      })
    }

    console.log(`📱 [OTP] Sending OTP to phone: +91${normalizedPhone}`)
    const otpResult = storeOTP(phone)

    if (!otpResult.success) {
      return res.status(429).json({
        error: otpResult.message,
        success: false
      })
    }

    const isDevelopment = process.env.NODE_ENV !== 'production'
    const responseData = {
      success: true,
      message: `✅ OTP sent to +91${normalizedPhone}. Please check your phone.`
    }

    if (isDevelopment) {
      responseData.otp = otpResult.otp
      responseData.debug = true
    }

    return res.status(200).json(responseData)
  } catch (err) {
    console.error('❌ [AUTH] Send OTP error:', err)
    return res.status(500).json({
      error: 'Failed to send OTP. Please try again.',
      success: false
    })
  }
}
