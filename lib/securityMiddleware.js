/**
 * Security Middleware
 * Protects API endpoints from common attacks
 */

import { verifyToken, verifyAdminToken, sanitizeInput } from './auth.js';

/**
 * Verify JWT authentication
 */
export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

/**
 * Verify admin access
 */
export function adminMiddleware(req, res, next) {
  const token = req.headers['x-admin-token'];

  if (!token || !verifyAdminToken(token)) {
    return res.status(403).json({ error: 'Forbidden: Invalid admin token' });
  }

  next();
}

/**
 * Verify JWT and admin role
 */
export function adminAuthMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  try {
    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

/**
 * Sanitize request body
 */
export function sanitizeMiddleware(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    }
  }
  next();
}

/**
 * Validate content type
 */
export function validateContentType(req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({ error: 'Content-Type must be application/json' });
    }
  }
  next();
}

/**
 * Add security headers
 */
export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
}

/**
 * Log security events
 */
export function securityLogging(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'WARN' : 'INFO';
    const log = `[${logLevel}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms) - IP: ${req.ip}`;
    
    console.log(log);
  });

  next();
}

export default {
  authMiddleware,
  adminMiddleware,
  adminAuthMiddleware,
  sanitizeMiddleware,
  validateContentType,
  securityHeaders,
  securityLogging,
};
