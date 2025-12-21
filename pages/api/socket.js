import { getIO } from '../../lib/socketServer'

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Get Socket.IO instance
    const io = getIO()
    res.status(200).json({ message: 'Socket.IO initialized', connected: !!io })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
