import { adminApiRoute } from '../../../../lib/adminProtection'
import { clients } from '../../../../lib/sse'

export default adminApiRoute(async function handler(req, res) {
  return res.status(200).json({ 
    connectedClients: clients.size 
  })
})
