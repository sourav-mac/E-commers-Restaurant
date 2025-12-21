// server.js - Custom Next.js server with Socket.IO support
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Create Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling request:', err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  // Store io instance globally for API routes
  global.io = io

  io.on('connection', (socket) => {
    console.log('🔌 [Socket.IO] Client connected:', socket.id)

    // Handle authentication
    socket.on('authenticate', (data) => {
      const { token } = data
      if (token) {
        console.log('🔐 [Socket.IO] Client authenticated:', socket.id)
        socket.emit('authenticated', { success: true })
        // Join admin room
        socket.join('admin')
      } else {
        console.log('🔐 [Socket.IO] Authentication failed for:', socket.id)
        socket.emit('authenticated', { success: false })
      }
    })

    socket.on('disconnect', () => {
      console.log('🔌 [Socket.IO] Client disconnected:', socket.id)
    })
  })

  httpServer
    .once('error', (err) => {
      console.error('Server error:', err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`🚀 Server ready on http://${hostname}:${port}`)
      console.log('🔌 Socket.IO initialized and ready for connections')
    })
})
