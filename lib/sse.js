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
  // keep connection alive and set retry
  res.write('retry: 10000\n\n')
  console.log('✅ SSE: client added, total clients now =', clients.size)

  const remove = () => {
    clients.delete(res)
    console.log('❌ SSE: client removed, total clients now =', clients.size)
  }

  reqOnClose(res, remove)

  // send periodic ping to keep proxies from closing the connection
  const ping = setInterval(() => {
    try {
      res.write(': ping\n\n')
      console.log('💓 SSE ping sent, active clients:', clients.size)
    } catch (err) {
      console.error('SSE ping failed:', err.message)
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
  const payload = `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`
  console.log(`SSE: broadcasting event "${name}" to ${clients.size} client(s)`)
  console.log('📊 Current clients in Set:', clients.size)
  if (clients.size === 0) {
    console.warn('⚠️  No SSE clients connected! Broadcasting will not be received.')
  }
  for (const res of clients) {
    try {
      res.write(payload)
      console.log('✅ Successfully wrote event to client')
    } catch (err) {
      console.error('SSE: failed to write to a client', err.message)
      // ignore failed writes
    }
  }
}
