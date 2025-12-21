/**
 * OTP Management Module
 * Handles OTP generation, storage, and verification
 */

import { readData, writeData } from './otpStore.js'

// OTP Configuration
const OTP_LENGTH = 6
const OTP_VALIDITY_MINUTES = 10 // OTP valid for 10 minutes
const OTP_MAX_ATTEMPTS = 5 // Max verification attempts
const RATE_LIMIT_MINUTES = 1 // Rate limit: 1 OTP per minute per phone

/**
 * Generate random OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString() // 6 digits
}

/**
 * Store OTP for a phone number
 * Returns: { success: boolean, message: string }
 */
function storeOTP(phone) {
  try {
    const data = readData()
    if (!data.otps) data.otps = {}

    const normalizedPhone = phone.replace(/\D/g, '').slice(-10)

    // Check rate limiting - prevent multiple OTP requests within 1 minute
    const existingOTP = data.otps[normalizedPhone]
    if (existingOTP && !isOTPExpired(existingOTP.createdAt, RATE_LIMIT_MINUTES)) {
      return {
        success: false,
        message: `Please wait before requesting a new OTP. Try again in ${getRemainingWaitTime(existingOTP.createdAt, RATE_LIMIT_MINUTES)} seconds.`
      }
    }

    const otp = generateOTP()
    const now = new Date().toISOString()

    // Store OTP with metadata
    data.otps[normalizedPhone] = {
      otp: otp,
      createdAt: now,
      attempts: 0,
      verified: false
    }

    writeData(data)

    return {
      success: true,
      message: 'OTP generated successfully',
      otp: otp  // Return for testing; in production, this should be sent via SMS
    }
  } catch (err) {
    console.error('❌ [OTP] Error storing OTP:', err)
    return {
      success: false,
      message: 'Failed to generate OTP'
    }
  }
}

/**
 * Verify OTP for a phone number
 * Returns: { success: boolean, message: string, verified: boolean }
 */
function verifyOTP(phone, otp) {
  try {
    const data = readData()
    if (!data.otps) {
      return {
        success: false,
        message: 'No OTP found. Please request a new one.',
        verified: false
      }
    }

    const normalizedPhone = phone.replace(/\D/g, '').slice(-10)
    const otpRecord = data.otps[normalizedPhone]

    if (!otpRecord) {
      return {
        success: false,
        message: 'No OTP found for this phone number. Please request a new one.',
        verified: false
      }
    }

    // Check if OTP is expired
    if (isOTPExpired(otpRecord.createdAt, OTP_VALIDITY_MINUTES)) {
      delete data.otps[normalizedPhone]
      writeData(data)
      return {
        success: false,
        message: `OTP expired. Valid for ${OTP_VALIDITY_MINUTES} minutes. Please request a new one.`,
        verified: false
      }
    }

    // Check if max attempts exceeded
    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      delete data.otps[normalizedPhone]
      writeData(data)
      return {
        success: false,
        message: `Too many incorrect attempts. Please request a new OTP.`,
        verified: false
      }
    }

    // Check if OTP matches
    if (otpRecord.otp.toString() !== otp.toString()) {
      otpRecord.attempts += 1
      writeData(data)
      const remaining = OTP_MAX_ATTEMPTS - otpRecord.attempts
      return {
        success: false,
        message: remaining > 0 
          ? `Incorrect OTP. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`
          : `Too many incorrect attempts. Please request a new OTP.`,
        verified: false
      }
    }

    // OTP verified successfully
    otpRecord.verified = true
    otpRecord.verifiedAt = new Date().toISOString()
    writeData(data)

    return {
      success: true,
      message: 'OTP verified successfully',
      verified: true,
      phone: normalizedPhone
    }
  } catch (err) {
    console.error('❌ [OTP] Error verifying OTP:', err)
    return {
      success: false,
      message: 'Failed to verify OTP',
      verified: false
    }
  }
}

/**
 * Mark OTP as used (after login)
 */
function clearOTP(phone) {
  try {
    const data = readData()
    if (!data.otps) return

    const normalizedPhone = phone.replace(/\D/g, '').slice(-10)
    delete data.otps[normalizedPhone]
    writeData(data)
  } catch (err) {
    console.error('❌ [OTP] Error clearing OTP:', err)
  }
}

/**
 * Check if OTP has expired
 */
function isOTPExpired(createdAt, validityMinutes) {
  const created = new Date(createdAt).getTime()
  const now = new Date().getTime()
  const expiryTime = created + (validityMinutes * 60 * 1000)
  return now > expiryTime
}

/**
 * Get remaining wait time in seconds for rate limiting
 */
function getRemainingWaitTime(createdAt, waitMinutes) {
  const created = new Date(createdAt).getTime()
  const now = new Date().getTime()
  const waitTime = waitMinutes * 60 * 1000
  const remaining = Math.ceil((created + waitTime - now) / 1000)
  return Math.max(0, remaining)
}

export { generateOTP, storeOTP, verifyOTP, clearOTP }
