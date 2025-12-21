/**
 * API: Logout user
 * POST /api/auth/logout
 * 
 * Clears authentication cookie and removes user session
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed. Use POST.'
    })
  }

  try {
    console.log('🔓 [AUTH] User logging out')

    // Clear authentication cookie
    res.setHeader('Set-Cookie', 'auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/')

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (err) {
    console.error('❌ [AUTH] Logout error:', err)
    return res.status(500).json({
      error: 'Failed to logout',
      success: false
    })
  }
}
