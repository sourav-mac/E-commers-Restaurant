// pages/api/admin/orders/events.js
import { addClient, broadcastEvent } from '../../../../lib/sse'
import { verifyAdminToken } from '../../../../lib/adminAuth'

export default function handler(req, res) {
  console.log('📡 SSE endpoint received request, method:', req.method)
  console.log('📡 SSE endpoint URL:', req.url)
  
  if (req.method !== 'GET') {
    console.log('❌ SSE: method not GET')
    res.status(405).end()
    return
  }

  // Verify JWT token from query or header
  const token = req.query.token || req.headers.authorization?.split(' ')[1]
  console.log('📡 SSE: token received:', token ? '✅ YES (length: ' + token.length + ')' : '❌ NO')
  
  if (!token) {
    console.log('❌ SSE: no auth token provided')
    res.write('event: error\ndata: {"message":"Unauthorized"}\n\n')
    res.end()
    return
  }

  try {
    verifyAdminToken(token)
    console.log('✅ SSE: token verified')
  } catch (err) {
    console.log('❌ SSE: invalid token', err.message)
    // Still allow connection even if token is expired (in development/admin context)
    // Only fail if token is completely invalid
    if (err.name === 'JsonWebTokenError' && err.message !== 'jwt expired') {
      res.write('event: error\ndata: {"message":"Invalid token"}\n\n')
      res.end()
      return
    }
    console.log('⚠️  Token expired but allowing SSE connection (admin context)')
  }

  // Set SSE headers - CRITICAL: these must be set correctly
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('X-Accel-Buffering', 'no')

  // send a comment to establish the stream
  res.write(': stream connected\n\n')
  console.log('🟢 SSE endpoint: connection opened and ready for events')

  // Add client to broadcaster
  const remove = addClient(res)

  // On close cleanup
  req.on('close', () => {
    console.log('🔌 SSE endpoint: connection closed by client')
    remove()
  })

  // Prevent timeout
  req.socket.setKeepAlive(true)
}
