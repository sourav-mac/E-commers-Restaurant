// pages/api/public/menu.js
import { readData } from '../../../lib/dataStore'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const menuData = readData('menu')
  
  return res.status(200).json({
    success: true,
    menu: menuData
  })
}
