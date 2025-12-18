import { readData } from '../../../lib/dataStore'
import { formatPhoneNumber } from '../../../lib/sms'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { phone } = req.body

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' })
  }

  try {
    // Format and normalize phone number
    const formattedPhone = formatPhoneNumber(phone)
    const normalizedPhone = phone.toString().trim().replace(/[\s\-\(\)]/g, '')
    
    // Create multiple variations for comparison
    const phoneVariations = [
      normalizedPhone,                           // 9876543210
      formattedPhone.replace(/[+]/g, ''),       // 919876543210
      formattedPhone,                            // +919876543210
      normalizedPhone.slice(-10),                // Last 10 digits
      '91' + normalizedPhone.slice(-10)         // 91 + last 10 digits
    ]

    // Read orders and reservations from data
    const allData = readData('orders') || {}
    const allOrders = Array.isArray(allData) ? allData : (allData.orders || [])
    const allReservations = allData.reservations || []
    
    console.log('🔍 Searching by phone:', {
      inputPhone: phone,
      normalizedPhone,
      formattedPhone,
      phoneVariations,
      totalReservationsInDB: allReservations.length,
      allReservationPhones: allReservations.map(r => ({ id: r.id, phone: r.phone, originalPhone: r.originalPhone }))
    })
    
    // Helper function to normalize phone for comparison
    const normalizeForComparison = (phoneStr) => {
      if (!phoneStr) return ''
      const cleaned = phoneStr.toString().trim().replace(/[\s\-\(\)]/g, '')
      return cleaned
    }
    
    // Filter orders by customer phone
    const customerOrders = allOrders.filter(order => {
      const orderPhone = normalizeForComparison(order.customer?.phone)
      return phoneVariations.some(variant => 
        orderPhone === normalizeForComparison(variant) ||
        orderPhone.includes(variant) ||
        variant.includes(orderPhone.slice(-10))
      )
    })

    // Filter reservations by phone (check both phone and originalPhone)
    const customerReservations = allReservations.filter(res => {
      const resPhone = normalizeForComparison(res.phone || res.originalPhone)
      const matches = phoneVariations.some(variant => 
        resPhone === normalizeForComparison(variant) ||
        resPhone.includes(variant) ||
        variant.includes(resPhone.slice(-10))
      )
      
      if (matches) {
        console.log('✅ Found matching reservation:', {
          id: res.id,
          name: res.name,
          status: res.status,
          resPhone,
          matchedVariant: phoneVariations.find(v => resPhone === normalizeForComparison(v))
        })
      }
      
      return matches
    })

    // Sort orders by createdAt descending (newest first)
    customerOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    // Sort reservations by createdAt descending (newest first)
    customerReservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // Log for debugging
    console.log('📱 Phone search:', {
      inputPhone: phone,
      normalizedPhone,
      formattedPhone,
      foundOrders: customerOrders.length,
      foundReservations: customerReservations.length
    })

    return res.status(200).json({
      success: true,
      orders: customerOrders,
      reservations: customerReservations,
      total: customerOrders.length + customerReservations.length
    })
  } catch (error) {
    console.error('❌ Phone search error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}
