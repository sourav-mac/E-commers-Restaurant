// Simple in-memory SSE broadcaster
// Use global to persist across hot-reloads in development
if (!global.sseClients) {
  global.sseClients = new Set()
}
export const clients = global.sseClients

export function addClient(res) {
  // enable TCP keep-alive if possible
  try {
    res.socket?.setKeepAlive?.(true)
  } catch (err) {
    // ignore
  }

  clients.add(res)
  console.log('✅ SSE: CLIENT ADDED, total clients now =', clients.size)
  console.log('📊 Current clients in Set:', Array.from(clients).length)
  
  // keep connection alive and set retry
  res.write('retry: 10000\n\n')
  console.log('✅ SSE: Initial retry message sent to client')

  const remove = () => {
    clients.delete(res)
    console.log('❌ SSE: CLIENT REMOVED, total clients now =', clients.size)
  }

  reqOnClose(res, remove)

  // send periodic ping to keep proxies from closing the connection
  const ping = setInterval(() => {
    try {
      res.write(': ping\n\n')
      console.log('💓 SSE: ping sent to', clients.size, 'active client(s)')
    } catch (err) {
      console.error('❌ SSE: ping failed:', err.message)
      // ignore
    }
  }, 20000)

  // ensure ping is cleared on close
  const wrapRemove = () => {
    clearInterval(ping)
    remove()
  }

  return wrapRemove
}

function reqOnClose(res, cb) {
  // Node response has 'close' event
  res.on('close', cb)
}

export function broadcastEvent(name, data) {
  console.log('\n')
  console.log('═══════════════════════════════════════════════════════')
  console.log('🎯 BROADCAST EVENT:', name)
  console.log('📊 Current connected clients:', clients.size)
  console.log('═══════════════════════════════════════════════════════')
  
  if (clients.size === 0) {
    console.warn('⚠️  ⚠️  ⚠️  NO SSE CLIENTS CONNECTED! Event will NOT be received!')
    console.warn('⚠️  Broadcast was called but nobody is listening!')
    return
  }
  
  const payload = `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`
  console.log('📤 Payload to send:', payload.substring(0, 150) + '...')
  console.log('📤 Payload bytes:', Buffer.byteLength(payload))
  
  let successCount = 0
  let failureCount = 0
  
  for (const res of clients) {
    try {
      // Write directly to socket and flush
      res.write(payload)
      
      // Try to flush the socket
      if (res.socket && typeof res.socket.write === 'function') {
        try {
          res.socket.flush?.()
        } catch (e) {
          // ignore
        }
      }
      
      successCount++
      console.log(`✅ Event sent to client (${successCount}/${clients.size})`)
    } catch (err) {
      failureCount++
      console.error(`❌ Failed to write to client: ${err.message}`)
    }
  }
  
  console.log(`📊 Broadcast complete: ${successCount} sent, ${failureCount} failed`)
  console.log('═══════════════════════════════════════════════════════\n')
}
