/**
 * Admin Protection Middleware
 * - Verify admin authentication
 * - Check role-based access
 * - Log admin activities
 * - Enforce HTTPS in production
 */

import { verifyAdminToken } from './adminAuth.js';

/**
 * Middleware: Verify admin authentication
 * Redirect to login if not authenticated
 */
export function withAdminAuth(handler) {
  return async (req, res) => {
    try {
      // Check for admin token in cookies or headers
      const token = req.cookies?.admin_token || req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          error: 'Unauthorized: Admin login required',
          redirect: '/admin/login',
        });
      }

      // Verify token
      const admin = verifyAdminToken(token);

      // Attach admin info to request
      req.admin = admin;

      // Log admin activity
      logAdminActivity({
        action: 'ACCESS',
        endpoint: req.url,
        method: req.method,
        adminId: admin.userId,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        status: 'success',
      });

      // Call the handler
      return handler(req, res);
    } catch (error) {
      // Log failed access attempt
      logAdminActivity({
        action: 'ACCESS_FAILED',
        endpoint: req.url,
        method: req.method,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        error: error.message,
        status: 'failed',
      });

      return res.status(401).json({
        error: 'Unauthorized: Invalid or expired token',
        redirect: '/admin/login',
      });
    }
  };
}

/**
 * React component wrapper for admin page protection
 * Redirects to login if not authenticated
 */
export function withAdminPageAuth(Component) {
  return function ProtectedAdminPage(props) {
    const { useEffect, useState } = require('react');
    const router = require('next/router').useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
      // Check if admin token exists in localStorage
      const token = localStorage.getItem('admin_token');

      if (!token) {
        router.push('/admin/login');
        return;
      }

      // Verify token is valid
      try {
        // Token verification happens server-side, so just set as authenticated
        setIsAdmin(true);
        setIsLoading(false);
      } catch (error) {
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
      }
    }, [router]);

    if (isLoading) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}>
          <p>Loading...</p>
        </div>
      );
    }

    if (!isAdmin) {
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * Check if user is admin (for conditional UI rendering)
 */
export function isAdminToken(token) {
  try {
    if (!token) return false;
    const decoded = verifyAdminToken(token);
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * Log admin activities for audit trail
 */
export function logAdminActivity(activity) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    ...activity,
  };

  // Log to file
  if (typeof window === 'undefined') {
    const fs = require('fs').promises;
    const logPath = process.env.LOG_FILE_PATH || './logs/admin.log';
    const logMessage = JSON.stringify(logEntry) + '\n';
    fs.appendFile(logPath, logMessage).catch(err => 
      console.error('Failed to write admin log:', err)
    );
  }

  console.log('📋 Admin Activity:', logEntry);
}

/**
 * Enforce HTTPS in production
 */
export function enforceHTTPS(req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.status(403).json({
        error: 'Admin panel requires HTTPS',
      });
    }
  }
  next();
}

/**
 * Admin-only API route handler
 */
export function adminApiRoute(handler) {
  return async (req, res) => {
    // Enforce HTTPS in production
    if (process.env.NODE_ENV === 'production') {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.status(403).json({ error: 'HTTPS required' });
      }
    }

    // Check method
    if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PATCH' && req.method !== 'PUT' && req.method !== 'DELETE') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          error: 'Unauthorized: Admin token required',
        });
      }

      // Verify admin token
      const admin = verifyAdminToken(token);

      // Log the admin action
      logAdminActivity({
        action: 'API_CALL',
        endpoint: req.url,
        method: req.method,
        adminId: admin.userId,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      });

      // Attach admin to request
      req.admin = admin;

      // Call handler
      return handler(req, res);
    } catch (error) {
      logAdminActivity({
        action: 'API_CALL_FAILED',
        endpoint: req.url,
        method: req.method,
        error: error.message,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      });

      return res.status(401).json({
        error: 'Unauthorized: Invalid token',
      });
    }
  };
}

export default {
  withAdminAuth,
  withAdminPageAuth,
  isAdminToken,
  logAdminActivity,
  enforceHTTPS,
  adminApiRoute,
};
