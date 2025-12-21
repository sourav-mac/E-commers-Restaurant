// Diagnostic endpoint to check SSE status
import { clients } from '../../../../lib/sse'
import { verifyAdminToken } from '../../../../lib/adminAuth'

export default function handler(req, res) {
  console.log('🔍 SSE STATUS CHECK endpoint called')
  
  // Verify JWT token from query or header
  const token = req.query.token || req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    verifyAdminToken(token)
  } catch (err) {
    console.log('⚠️ Token verification failed but allowing status check')
  }

  const clientCount = clients.size
  console.log('🔍 Current clients in SSE Set:', clientCount)
  console.log('🔍 Clients object:', clients)
  console.log('🔍 Clients constructor:', clients.constructor.name)
  
  res.status(200).json({ 
    ok: true,
    connectedClients: clientCount,
    clients: `${clientCount} client(s) connected`,
    timestamp: new Date().toISOString()
  })
}
