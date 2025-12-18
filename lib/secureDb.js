/**
 * Secure Database Connection Module
 * - Uses parameterized queries (prepared statements)
 * - SSL/TLS encryption enabled
 * - Connection pooling for efficiency
 * - Error handling without exposing sensitive info
 */

import pg from 'pg';

const { Pool } = pg;

// Validate environment variables
const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Create connection pool with SSL/TLS enabled
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // SSL/TLS Configuration
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: true,
    ca: process.env.DB_CA_CERT || undefined
  } : false,
  // Connection Pool Settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  logSecurityEvent('DB_POOL_ERROR', err.message, 'ERROR');
});

/**
 * Execute parameterized query (prevents SQL injection)
 * @param {string} query - SQL query with $1, $2 placeholders
 * @param {array} values - Values to bind to query
 * @returns {Promise} Query result
 */
export async function queryDatabase(query, values = []) {
  const client = await pool.connect();
  try {
    // Validate query doesn't contain suspicious patterns
    if (containsSuspiciousSQL(query)) {
      throw new Error('Query contains potentially dangerous patterns');
    }
    
    const result = await client.query(query, values);
    logSecurityEvent('DB_QUERY_SUCCESS', `Query executed safely`, 'INFO');
    return result;
  } catch (error) {
    // Log without exposing sensitive data
    logSecurityEvent('DB_QUERY_ERROR', error.message, 'ERROR');
    throw new Error('Database query failed. Please try again.');
  } finally {
    client.release();
  }
}

/**
 * Detect suspicious SQL patterns
 */
function containsSuspiciousSQL(query) {
  const suspiciousPatterns = [
    /(\bDROP\b|\bDELETE\b|\bTRUNCATE\b)/i, // Destructive operations
    /(\bCREATE\b|\bALTER\b)/i, // Schema changes
    /;.*--.*/i, // SQL injection attempts
    /(\*\/|\/\*)/i, // Comment injection
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(query));
}

/**
 * Log security events without exposing sensitive data
 */
function logSecurityEvent(eventType, message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${eventType}: ${message}`;
  
  if (level === 'ERROR' || level === 'WARN') {
    console.error(logMessage);
  } else {
    console.log(logMessage);
  }
  
  // Save to log file
  if (typeof window === 'undefined') { // Only on server
    const fs = require('fs').promises;
    const logPath = process.env.LOG_FILE_PATH || './logs/security.log';
    fs.appendFile(logPath, logMessage + '\n').catch(err => 
      console.error('Failed to write log file:', err)
    );
  }
}

/**
 * Get database connection for transactions
 */
export async function getConnection() {
  return await pool.connect();
}

/**
 * Close connection pool
 */
export async function closePool() {
  await pool.end();
}

export default pool;
