// pages/api/menu.js
import menu from '../../data/menu.json'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Return menu with item IDs for cart tracking
  const itemsWithIds = menu.items.map((item, idx) => ({
    id: idx,
    ...item
  }))

  res.status(200).json({
    ok: true,
    items: itemsWithIds,
    categories: menu.categories
  })
}
