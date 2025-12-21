// pages/api/admin/settings.js
import { adminApiRoute } from '../../../lib/adminProtection'
import { readData, writeData } from '../../../lib/dataStore'

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

export default adminApiRoute(async function handler(req, res) {
  // Token already verified by adminApiRoute middleware
  // req.admin contains authenticated user data

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
})
