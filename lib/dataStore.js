// lib/dataStore.js
const fs = require('fs')
const path = require('path')

const dataDir = path.join(process.cwd(), 'data')

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dataFiles = {
  menu: path.join(dataDir, 'menu.json'),
  orders: path.join(dataDir, 'orders.json'),
  payments: path.join(dataDir, 'payments.json'),
  settings: path.join(dataDir, 'settings.json'),
  reviews: path.join(dataDir, 'reviews.json'),
  admin_credentials: path.join(dataDir, 'admin_credentials.json')
}

function ensureFileExists(filePath, defaultData) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2))
  }
}

function readData(key) {
  try {
    const filePath = dataFiles[key]
    if (!filePath) throw new Error(`Unknown data key: ${key}`)
    
    ensureFileExists(filePath, getDefaultData(key))
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    console.error(`Error reading ${key}:`, err)
    return getDefaultData(key)
  }
}

function writeData(key, data) {
  try {
    const filePath = dataFiles[key]
    if (!filePath) throw new Error(`Unknown data key: ${key}`)
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (err) {
    console.error(`Error writing ${key}:`, err)
    return false
  }
}

function getDefaultData(key) {
  const defaults = {
    menu: {
      categories: ['Starters', 'Main Course', 'Rice & Noodles', 'Breads', 'Beverages', 'Desserts'],
      items: [
        { _id: 'item_001', name: 'Chicken Lollipop', category: 'Starters', price: 180, available: true },
        { _id: 'item_002', name: 'Fried Rice', category: 'Rice & Noodles', price: 120, available: true },
        { _id: 'item_003', name: 'Puchka', category: 'Starters', price: 40, available: true },
        { _id: 'item_004', name: 'Samosa', category: 'Starters', price: 15, available: true },
        { _id: 'item_005', name: 'Chowmein', category: 'Rice & Noodles', price: 130, available: true },
        { _id: 'item_006', name: 'Lassi', category: 'Beverages', price: 80, available: true },
        { _id: 'item_007', name: 'Chai', category: 'Beverages', price: 30, available: true }
      ]
    },
    orders: {
      orders: [],
      reservations: []
    },
    payments: [],
    settings: {
      delivery_fee: 50,
      min_order_value: 0,
      tax_rate: 0,
      opening_time: '10:00',
      closing_time: '22:00',
      holidays: [],
      payment_methods: { cod: true, razorpay: true }
    },
    reviews: {
      reviews: []
    },
    admin_credentials: {
      username: 'admin',
      passwordHash: '$2b$12$kq1ehoiYq6UmAHRTvafNlOTCV58hBK20MWo0y8gN1bx6b0nvyYIu6' // ChangeMe@12345
    }
  }
  return defaults[key] || {}
}

export { readData, writeData }
