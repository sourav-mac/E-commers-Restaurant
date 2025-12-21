/**
 * API: Verify OTP and generate authentication token
 * POST /api/auth/verify-otp
 */

const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')

const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'

function verifyOTP(phone, otp) {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    const otpsFile = path.join(dataDir, 'otps.json')
    
    if (!fs.existsSync(otpsFile)) {
      return { success: false, message: 'No OTP found', verified: false }
    }
    
    const data = JSON.parse(fs.readFileSync(otpsFile, 'utf8'))
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10)
    const otpRecord = data.otps?.[normalizedPhone]
    
    if (!otpRecord) {
      return { success: false, message: 'No OTP found. Please request a new one.', verified: false }
    }
    
    if (otpRecord.otp.toString() !== otp.toString()) {
      return { success: false, message: 'Incorrect OTP', verified: false }
    }
    
    return { success: true, message: 'OTP verified', verified: true }
  } catch (err) {
    console.error('❌ [OTP] Error verifying OTP:', err)
    return { success: false, message: 'Verification failed', verified: false }
  }
}

function clearOTP(phone) {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    const otpsFile = path.join(dataDir, 'otps.json')
    
    if (fs.existsSync(otpsFile)) {
      const data = JSON.parse(fs.readFileSync(otpsFile, 'utf8'))
      const normalizedPhone = phone.replace(/\D/g, '').slice(-10)
      if (data.otps?.[normalizedPhone]) {
        delete data.otps[normalizedPhone]
        fs.writeFileSync(otpsFile, JSON.stringify(data, null, 2))
      }
    }
  } catch (err) {
    console.error('❌ [OTP] Error clearing OTP:', err)
  }
}

function generateToken(phone) {
  const normalizedPhone = phone.replace(/\D/g, '').slice(-10)
  const token = jwt.sign(
    { phone: normalizedPhone, iat: Math.floor(Date.now() / 1000) },
    SECRET_KEY,
    { expiresIn: '7d', algorithm: 'HS256' }
  )
  return token
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed. Use POST.',
      success: false
    })
  }

  try {
    const { phone, otp } = req.body

    // Validate inputs
    if (!phone || !otp) {
      return res.status(400).json({
        error: 'Phone number and OTP are required.',
        success: false
      })
    }

    if (otp.toString().length !== 6) {
      return res.status(400).json({
        error: 'Invalid OTP format. OTP must be 6 digits.',
        success: false
      })
    }

    // Normalize phone number
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10)
    console.log(`🔐 [AUTH] Verifying OTP for phone: +91${normalizedPhone}`)

    // Verify OTP
    const otpResult = verifyOTP(phone, otp)

    if (!otpResult.verified) {
      return res.status(400).json({
        error: otpResult.message,
        success: false
      })
    }

    // Generate JWT token
    const token = generateToken(normalizedPhone)

    // Clear OTP after successful verification
    clearOTP(normalizedPhone)

    // Set HTTP-only cookie with token
    res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`)

    console.log(`✅ [AUTH] Login successful for phone: +91${normalizedPhone}`)

    return res.status(200).json({
      success: true,
      message: '✅ Login successful. Redirecting to your orders...',
      token: token,
      phone: normalizedPhone
    })
  } catch (err) {
    console.error('❌ [AUTH] Verify OTP error:', err)
    return res.status(500).json({
      error: 'Failed to verify OTP. Please try again.',
      success: false
    })
  }
}
