/**
 * Authentication & Password Security Module
 * - Uses bcrypt for password hashing (industry standard)
 * - JWT tokens for session management
 * - Prevents common auth vulnerabilities
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 12; // High rounds = slower but more secure
const TOKEN_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  
  // Check password complexity
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    throw new Error('Password must contain uppercase, lowercase, and numbers');
  }
  
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password against hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 * @param {string} userId - User ID
 * @param {string} role - User role (admin, user)
 * @returns {string} JWT token
 */
export function generateAccessToken(userId, role = 'user') {
  return jwt.sign(
    { userId, role, type: 'access' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: TOKEN_EXPIRY }
  );
}

/**
 * Generate JWT refresh token
 * @param {string} userId - User ID
 * @returns {string} JWT refresh token
 */
export function generateRefreshToken(userId) {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Verify admin token
 * @param {string} token - Admin token
 * @returns {boolean} True if valid admin token
 */
export function verifyAdminToken(token) {
  const expected = process.env.ADMIN_TOKEN || 'admin-secret-key';
  return token === expected && token.length > 20; // Ensure strong token
}

/**
 * Generate secure random token
 * @param {number} length - Token length
 * @returns {string} Random token
 */
export function generateSecureToken(length = 32) {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .substring(0, 1000); // Max 1000 chars
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number
 * @returns {boolean} True if valid phone
 */
export function isValidPhone(phone) {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export default {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyAdminToken,
  generateSecureToken,
  sanitizeInput,
  isValidEmail,
  isValidPhone,
};
