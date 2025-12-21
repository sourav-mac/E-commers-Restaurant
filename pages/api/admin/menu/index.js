// pages/api/admin/menu.js
import { adminApiRoute } from '../../../../lib/adminProtection'
import { readData, writeData } from '../../../../lib/dataStore'

export default adminApiRoute(async function handler(req, res) {
  // Token already verified by adminApiRoute middleware
  // req.admin contains authenticated user data

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
})
