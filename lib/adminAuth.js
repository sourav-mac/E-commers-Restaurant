/**
 * Admin Authentication & Authorization Module
 * - Secure admin login
 * - JWT session management
 * - Role-Based Access Control (RBAC)
 * - Password hashing with bcrypt
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readData } from './dataStore';

// Hardcoded admin credentials (for first setup ONLY)
// In production, this should be in database with proper admin user
const HARDCODED_ADMIN = {
  username: 'admin',
  // This hash is for password: "ChangeMe@12345" (16+ chars, uppercase, lowercase, numbers)
  // MUST be changed after first login!
  passwordHash: '$2b$12$kq1ehoiYq6UmAHRTvafNlOTCV58hBK20MWo0y8gN1bx6b0nvyYIu6',
  role: 'admin',
  createdAt: new Date(),
};

/**
 * Get admin credentials from persistent storage or use defaults
 * @returns {object} Admin credentials object
 */
function getAdminCredentials() {
  try {
    const stored = readData('admin_credentials');
    if (stored && stored.username && stored.passwordHash) {
      return stored;
    }
  } catch (err) {
    console.error('Error reading stored admin credentials:', err);
  }
  // Fallback to hardcoded if no stored credentials
  return HARDCODED_ADMIN;
}

/**
 * Validate admin credentials and generate JWT token
 * @param {string} username - Admin username
 * @param {string} password - Admin password (plain text)
 * @returns {Promise<{token: string, refreshToken: string}>}
 */
export async function authenticateAdmin(username, password) {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }

  // Get current admin credentials from persistent storage
  const adminCreds = getAdminCredentials();

  // Check against stored/default admin credentials
  if (username !== adminCreds.username) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, adminCreds.passwordHash);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // Generate tokens
  const accessToken = jwt.sign(
    {
      userId: 'admin-1',
      username: HARDCODED_ADMIN.username,
      role: 'admin',
      type: 'access',
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    {
      userId: 'admin-1',
      type: 'refresh',
    },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

/**
 * Verify admin token and extract user data
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
export function verifyAdminToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Verify it's an admin token
    if (decoded.role !== 'admin') {
      throw new Error('Not an admin token');
    }

    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Generate new access token from refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {string} New access token
 */
export function refreshAccessToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret');

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Generate new access token
    const accessToken = jwt.sign(
      {
        userId: decoded.userId,
        username: 'admin', // In production, fetch from DB
        role: 'admin',
        type: 'access',
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    return accessToken;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}

/**
 * Hash new admin password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Bcrypt hash
 */
export async function hashAdminPassword(password) {
  // Validate password strength
  if (password.length < 16) {
    throw new Error('Password must be at least 16 characters');
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error('Password must contain uppercase, lowercase, and numbers');
  }

  return await bcrypt.hash(password, 12);
}

/**
 * Validate admin password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result
 */
export function validatePasswordStrength(password) {
  const errors = [];

  if (!password || password.length < 16) {
    errors.push('Password must be at least 16 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain numbers');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain special characters (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export default {
  authenticateAdmin,
  verifyAdminToken,
  refreshAccessToken,
  hashAdminPassword,
  validatePasswordStrength,
};
