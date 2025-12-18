import { readData } from '../../../lib/dataStore'

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

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const settings = readData('settings') || defaultSettings
    return res.status(200).json({
      success: true,
      settings
    })
  } catch (err) {
    console.error('Failed to fetch settings:', err)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch settings',
      settings: defaultSettings
    })
  }
}
