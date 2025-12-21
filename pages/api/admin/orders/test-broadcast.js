import { adminApiRoute } from '../../../../lib/adminProtection'
import { broadcastEvent } from '../../../../lib/sse'

export default adminApiRoute(async function handler(req, res) {
  console.log('📟 TEST-BROADCAST endpoint called, method:', req.method)
  
  if (req.method !== 'GET') {
    console.log('❌ Method not GET, returning 405')
    return res.status(405).end()
  }

  const sampleOrder = {
    order_id: `TEST-${Date.now()}`,
    customer: { name: 'Test User', phone: '0000000000' },
    total: 123,
    status: 'placed',
    createdAt: new Date().toISOString()
  }

  console.log('🎯 Test broadcast: sending sample order', sampleOrder.order_id)
  broadcastEvent('new-order', sampleOrder)
  console.log('✅ Broadcast sent!')

  res.status(200).json({ ok: true, sent: sampleOrder })
})