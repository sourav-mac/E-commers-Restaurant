// pages/api/admin/login.js
import jwt from 'jsonwebtoken'

const ADMIN_CREDENTIALS = {
  email: 'admin@petuk.com',
  password: 'admin123'
}

const JWT_SECRET = 'petuk-admin-secret-key-2024'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body

  // Validate credentials
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    // Generate JWT token
    const token = jwt.sign(
      { email, role: 'admin', exp: Math.floor(Date.now() / 1000) + 86400 }, // 24 hours
      JWT_SECRET
    )

    return res.status(200).json({
      success: true,
      token,
      role: 'admin',
      message: 'Login successful'
    })
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid credentials'
  })
}
