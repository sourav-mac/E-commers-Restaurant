// pages/api/cart.js
import { readData } from '../../../lib/dataStore'

/**
 * GET /api/cart - Retrieve server-persisted cart for a user (if phone/customer_id provided)
 * POST /api/cart - Save or merge cart items; server validates prices
 */
export default function handler(req, res) {
  if (req.method === 'GET') {
    // In a real system, retrieve from DB based on customer_id or session
    // For now, return empty cart
    const settings = readData('settings') || {}
    return res.status(200).json({
      ok: true,
      items: [],
      subtotal: 0,
      tax: 0,
      delivery_fee: settings.delivery_fee || 50,
      total: settings.delivery_fee || 50
    })
  }

  if (req.method === 'POST') {
    const { items } = req.body

    if (!Array.isArray(items)) {
      return res.status(400).json({ ok: false, error: 'Items must be an array' })
    }

    // Fetch settings for tax and delivery fee
    const settings = readData('settings') || {}
    const tax_rate = settings.tax_rate || 0
    const delivery_fee = settings.delivery_fee || 50

    // Validate quantities and fetch prices from server (never trust client prices)
    const menuData = readData('menu')
    let subtotal = 0
    const validatedItems = []

    for (const cartItem of items) {
      const { item_id, qty } = cartItem
      const menuItem = menuData.items[item_id]

      if (!menuItem) {
        return res.status(400).json({ ok: false, error: `Item ${item_id} not found` })
      }

      if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
        return res.status(400).json({ ok: false, error: `Invalid quantity for ${menuItem.name}` })
      }

      const itemTotal = menuItem.price * qty
      subtotal += itemTotal

      validatedItems.push({
        item_id,
        name: menuItem.name,
        price: menuItem.price,
        qty,
        itemTotal
      })
    }

    const tax = Math.round(subtotal * (tax_rate / 100))
    const total = subtotal + tax + delivery_fee

    res.status(200).json({
      ok: true,
      items: validatedItems,
      subtotal,
      tax,
      delivery_fee,
      total
    })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
