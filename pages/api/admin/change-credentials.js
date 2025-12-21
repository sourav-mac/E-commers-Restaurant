// pages/api/admin/change-credentials.js
import { adminApiRoute } from '../../../lib/adminProtection'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { readData, writeData } from '../../../lib/dataStore'
import { logAdminActivity } from '../../../lib/adminProtection'
import { sendSMS, formatPhoneNumber } from '../../../lib/sms'

// Default admin credentials
const DEFAULT_ADMIN_CREDS = {
  username: 'admin',
  passwordHash: '$2b$12$kq1ehoiYq6UmAHRTvafNlOTCV58hBK20MWo0y8gN1bx6b0nvyYIu6', // ChangeMe@12345
}

function getAdminCredentials() {
  try {
    const stored = readData('admin_credentials')
    if (stored && stored.username && stored.passwordHash) {
      return stored
    }
  } catch (err) {
    console.error('Error reading admin credentials:', err)
  }
  return DEFAULT_ADMIN_CREDS
}

export default adminApiRoute(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Token already verified by adminApiRoute middleware
  // req.admin contains authenticated user data

  try {
    const { currentPassword, newUsername, newPassword, confirmPassword } = req.body

    // Get current credentials from persistent storage
    const adminCreds = getAdminCredentials()

    // Validate input
    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password is required for security verification'
      })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      adminCreds.passwordHash
    )
    if (!isCurrentPasswordValid) {
      logAdminActivity({
        action: 'CREDENTIAL_CHANGE_FAILED',
        reason: 'Invalid current password',
        adminId: req.admin.userId,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
      })
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      })
    }

    // Prepare updated credentials object
    const updatedCreds = { ...adminCreds }

    // Change username if provided
    if (newUsername && newUsername.trim()) {
      const trimmedUsername = newUsername.trim().toLowerCase()
      if (trimmedUsername.length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Username must be at least 3 characters'
        })
      }
      updatedCreds.username = trimmedUsername
    }

    // Change password if provided
    if (newPassword && newPassword.trim()) {
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'New passwords do not match'
        })
      }

      if (newPassword.length < 12) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 12 characters'
        })
      }

      // Validate password strength (uppercase, lowercase, number, special char)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          success: false,
          error: 'Password must contain uppercase, lowercase, number, and special character'
        })
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12)
      const newPasswordHash = await bcrypt.hash(newPassword, salt)
      updatedCreds.passwordHash = newPasswordHash

      // Log successful password change
      logAdminActivity({
        action: 'PASSWORD_CHANGED',
        adminId: req.admin.userId,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      })
    }

    // Save updated credentials to persistent storage
    writeData('admin_credentials', updatedCreds)

    console.log('✅ Credentials updated:', {
      usernameChanged: !!newUsername,
      newUsername: newUsername ? updatedCreds.username : 'unchanged',
      passwordChanged: !!newPassword,
      hashLength: updatedCreds.passwordHash.length
    })

    // Log successful credential change
    logAdminActivity({
      action: 'CREDENTIALS_UPDATED',
      details: newUsername ? 'username_and_password' : 'password_only',
      adminId: req.admin.userId,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    })

    // Send SMS notification to admin phone
    try {
      const adminPhone = process.env.ADMIN_PHONE || '+919832358231';
      const changes = [];
      
      if (newUsername) {
        changes.push(`Username changed to: ${updatedCreds.username}`);
      }
      if (newPassword) {
        changes.push('Password changed');
      }

      const smsMessage = `🔐 PETUK ADMIN SECURITY ALERT

Your admin credentials have been updated:
${changes.join('\n')}

⏰ Time: ${new Date().toLocaleString('en-IN')}
📍 IP: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}

If this was not you, contact support immediately!

#PetukRestaurant`;

      await sendSMS(adminPhone, smsMessage);
      console.log('✅ Security notification SMS sent to admin');
    } catch (smsErr) {
      console.error('⚠️ Failed to send SMS notification:', smsErr.message);
      // Don't fail the credential change if SMS fails
    }

    return res.status(200).json({
      success: true,
      message: 'Credentials updated successfully',
      details: {
        usernameChanged: !!newUsername,
        passwordChanged: !!newPassword
      }
    })
  } catch (error) {
    console.error('Error changing credentials:', error)
    logAdminActivity({
      action: 'CREDENTIAL_CHANGE_ERROR',
      reason: error.message,
      adminId: req.admin?.userId || 'unknown',
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    })

    return res.status(500).json({
      success: false,
      error: 'Failed to update credentials'
    })
  }
})
