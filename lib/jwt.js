/**
 * JWT Token Management
 * Securely generates and verifies JWT tokens for user authentication
 */

const jwt = require('jsonwebtoken')

const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
const TOKEN_EXPIRY = '7d' // Token expires in 7 days

/**
 * Generate JWT token for authenticated user
 */
function generateToken(phone) {
  try {
    // Normalize phone number
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10)
    
    // Create payload
    const payload = {
      phone: normalizedPhone,
      iat: Math.floor(Date.now() / 1000) // Issued at
    }

    // Sign token
    const token = jwt.sign(payload, SECRET_KEY, {
      expiresIn: TOKEN_EXPIRY,
      algorithm: 'HS256'
    })

    console.log(`✅ [JWT] Token generated for phone: ${normalizedPhone}`)
    return token
  } catch (err) {
    console.error('❌ [JWT] Error generating token:', err)
    throw new Error('Failed to generate authentication token')
  }
}

/**
 * Verify JWT token and extract payload
 */
function verifyToken(token) {
  try {
    if (!token) {
      return {
        valid: false,
        message: 'No token provided'
      }
    }

    const decoded = jwt.verify(token, SECRET_KEY, {
      algorithms: ['HS256']
    })

    console.log(`✅ [JWT] Token verified for phone: ${decoded.phone}`)
    return {
      valid: true,
      payload: decoded,
      phone: decoded.phone
    }
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.log('⏰ [JWT] Token expired')
      return {
        valid: false,
        message: 'Token expired. Please login again.'
      }
    } else if (err.name === 'JsonWebTokenError') {
      console.log('❌ [JWT] Invalid token')
      return {
        valid: false,
        message: 'Invalid token'
      }
    } else {
      console.error('❌ [JWT] Verification error:', err)
      return {
        valid: false,
        message: 'Token verification failed'
      }
    }
  }
}

/**
 * Decode token without verification (for debugging)
 */
function decodeToken(token) {
  try {
    return jwt.decode(token)
  } catch (err) {
    console.error('❌ [JWT] Error decoding token:', err)
    return null
  }
}

export { generateToken, verifyToken, decodeToken }
