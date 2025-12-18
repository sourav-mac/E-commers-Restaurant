// pages/api/cart/apply-promo.js

// Mock promo codes (in a real system, these would come from a DB)
const promoCodes = {
  'WELCOME10': { discount: 50, description: 'Welcome offer: ₹50 off', expiresAt: '2025-12-31' },
  'SAVE20': { discount: 100, description: 'Save ₹100 on orders above ₹300', expiresAt: '2025-12-31', minAmount: 300 },
  'SPECIAL50': { discount: 200, description: 'Flat ₹200 discount', expiresAt: '2025-12-31' }
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  const { promo_code, subtotal } = req.body

  if (!promo_code || typeof promo_code !== 'string') {
    return res.status(400).json({ ok: false, error: 'Promo code is required' })
  }

  const code = promo_code.toUpperCase().trim()
  const promo = promoCodes[code]

  if (!promo) {
    return res.status(404).json({ ok: false, error: 'Promo code not found or invalid' })
  }

  // Check expiry
  if (new Date() > new Date(promo.expiresAt)) {
    return res.status(400).json({ ok: false, error: 'Promo code has expired' })
  }

  // Check minimum amount
  if (promo.minAmount && subtotal < promo.minAmount) {
    return res.status(400).json({
      ok: false,
      error: `Minimum order amount ₹${promo.minAmount} required for this promo`
    })
  }

  res.status(200).json({
    ok: true,
    promo_code: code,
    discount: promo.discount,
    description: promo.description
  })
}
