// pages/api/admin/menu.js
import jwt from 'jsonwebtoken'
import { readData, writeData } from '../../../../lib/dataStore'

const JWT_SECRET = 'petuk-admin-secret-key-2024'

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
    const menuData = readData('menu')
    return res.status(200).json({
      success: true,
      items: menuData.items || []
    })
  }

  if (req.method === 'POST') {
    const { name, category, price, available } = req.body
    const menuData = readData('menu')
    
    const newItem = {
      _id: 'item_' + Date.now(),
      name,
      category,
      price: parseFloat(price),
      available: available !== false
    }
    
    menuData.items.push(newItem)
    writeData('menu', menuData)
    
    return res.status(201).json({ success: true, item: newItem })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
