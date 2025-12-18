import { clients } from '../../../../lib/sse'

export default function handler(req, res) {
  return res.status(200).json({ 
    connectedClients: clients.size 
  })
}
