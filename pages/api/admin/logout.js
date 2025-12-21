/**
 * Admin Logout API Endpoint
 * POST /api/admin/logout
 * 
 * Clears admin session and logs activity
 */

import { logAdminActivity } from '@/lib/adminProtection';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const username = req.query.username || 'admin';

    // Log logout
    logAdminActivity({
      action: 'LOGOUT',
      username,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    });

    // Clear cookies
    res.setHeader(
      'Set-Cookie',
      [
        'admin_token=; HttpOnly; Secure; SameSite=Strict; Path=/admin; Max-Age=0',
        'admin_refresh=; HttpOnly; Secure; SameSite=Strict; Path=/admin; Max-Age=0',
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Logout failed',
    });
  }
}
