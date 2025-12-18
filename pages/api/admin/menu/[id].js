// pages/api/admin/menu/[id].js
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
  const { id } = req.query

  // Verify JWT token
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')

  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'PUT') {
    const menuData = readData('menu')
    const itemIndex = menuData.items.findIndex(item => item._id === id)
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const { name, category, price, available } = req.body
    menuData.items[itemIndex] = {
      ...menuData.items[itemIndex],
      name: name || menuData.items[itemIndex].name,
      category: category || menuData.items[itemIndex].category,
      price: price !== undefined ? parseFloat(price) : menuData.items[itemIndex].price,
      available: available !== undefined ? available : menuData.items[itemIndex].available
    }

    writeData('menu', menuData)
    return res.status(200).json({ success: true, item: menuData.items[itemIndex] })
  }

  if (req.method === 'DELETE') {
    const menuData = readData('menu')
    const itemIndex = menuData.items.findIndex(item => item._id === id)
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const deletedItem = menuData.items.splice(itemIndex, 1)
    writeData('menu', menuData)
    
    return res.status(200).json({ success: true, message: 'Item deleted', item: deletedItem[0] })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
