/**
 * Admin Login API Endpoint (SECURE VERSION)
 * POST /api/admin/login
 * 
 * Security Features:
 * - Rate limiting (5 attempts / 15 minutes)
 * - Bcrypt password hashing
 * - JWT token generation
 * - Failed attempt logging
 * - HTTP-only secure cookies
 */

import { authenticateAdmin } from '@/lib/adminAuth';
import { loginLimiter } from '@/lib/rateLimiter';
import { logAdminActivity } from '@/lib/adminProtection';

export default function handler(req, res) {
  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting (max 5 attempts per 15 minutes)
  return loginLimiter(req, res, async () => {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        logAdminActivity({
          action: 'LOGIN_FAILED',
          reason: 'Missing credentials',
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        });

        return res.status(400).json({
          error: 'Username and password are required',
        });
      }

      // Sanitize username (prevent injection)
      const sanitizedUsername = String(username)
        .toLowerCase()
        .trim()
        .substring(0, 50);

      // Authenticate admin
      const { accessToken, refreshToken } = await authenticateAdmin(
        sanitizedUsername,
        password
      );

      // Log successful login
      logAdminActivity({
        action: 'LOGIN_SUCCESS',
        username: sanitizedUsername,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      // Set secure HTTP-only cookies
      res.setHeader(
        'Set-Cookie',
        [
          `admin_token=${accessToken}; HttpOnly; Secure; SameSite=Strict; Path=/admin; Max-Age=3600`,
          `admin_refresh=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/admin; Max-Age=604800`,
        ]
      );

      // Also return tokens for client state (optional)
      return res.status(200).json({
        success: true,
        accessToken,
        refreshToken,
        message: 'Admin login successful',
      });
    } catch (error) {
      // Log failed login attempt
      logAdminActivity({
        action: 'LOGIN_FAILED',
        reason: error.message,
        username: req.body?.username || 'unknown',
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      return res.status(401).json({
        error: error.message || 'Invalid credentials',
      });
    }
  });
}
