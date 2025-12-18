// pages/api/admin/settings.js
import jwt from 'jsonwebtoken'
import { readData, writeData } from '../../../lib/dataStore'

const JWT_SECRET = 'petuk-admin-secret-key-2024'

const defaultSettings = {
  delivery_fee: 50,
  min_order_value: 0,
  tax_rate: 0,
  opening_time: '10:00',
  closing_time: '22:00',
  holidays: [],
  payment_methods: {
    cod: true,
    razorpay: true
  }
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

export default function handler(req, res) {
  // Verify JWT token
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')

  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    const appSettings = readData('settings') || defaultSettings
    return res.status(200).json({
      success: true,
      settings: appSettings
    })
  }

  if (req.method === 'POST') {
    const updatedSettings = { ...defaultSettings, ...req.body }
    writeData('settings', updatedSettings)
    return res.status(200).json({
      success: true,
      message: 'Settings updated',
      settings: updatedSettings
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
