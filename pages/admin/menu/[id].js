// pages/api/admin/menu/[id].js
import jwt from 'jsonwebtoken'

// Mock menu items database
let mockMenuItems = [
  {
    _id: 'item_001',
    name: 'Chicken Lollipop',
    category: 'Starters',
    price: 180,
    available: true
  },
  {
    _id: 'item_002',
    name: 'Fried Rice',
    category: 'Rice & Noodles',
    price: 120,
    available: true
  }
]

const JWT_SECRET = 'petuk-admin-secret-key-2024'

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

export const getStaticProps = () => {
  return {
    notFound: true,
  }
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export default function handler(req, res) {
  const { id } = req.query || {}

  // Verify JWT token
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')

  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'PUT') {
    const itemIndex = mockMenuItems.findIndex(item => item._id === id)
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const { name, category, price, available } = req.body
    mockMenuItems[itemIndex] = {
      ...mockMenuItems[itemIndex],
      name: name || mockMenuItems[itemIndex].name,
      category: category || mockMenuItems[itemIndex].category,
      price: price !== undefined ? parseFloat(price) : mockMenuItems[itemIndex].price,
      available: available !== undefined ? available : mockMenuItems[itemIndex].available
    }

    return res.status(200).json({
      success: true,
      item: mockMenuItems[itemIndex]
    })
  }

  if (req.method === 'DELETE') {
    const itemIndex = mockMenuItems.findIndex(item => item._id === id)
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' })
    }

    const deletedItem = mockMenuItems.splice(itemIndex, 1)
    return res.status(200).json({
      success: true,
      message: 'Item deleted',
      item: deletedItem[0]
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
