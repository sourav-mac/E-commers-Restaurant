/**
 * Admin Database Module
 * 
 * Handles all database operations for admin management.
 * Uses secure, parameterized queries to prevent SQL injection.
 */

import { queryDatabase } from './secureDb';

/**
 * Fetch admin by username from database
 * @param {string} username - Admin username
 * @returns {Promise<Object|null>} Admin object or null
 */
export async function getAdminByUsername(username) {
  try {
    const result = await queryDatabase(
      'SELECT id, username, email, password_hash, role, is_active, last_login FROM admins WHERE username = $1 AND is_active = true',
      [username]
    );
    
    return result.rows[0] || null;
  } catch (err) {
    console.error('Error fetching admin by username:', err);
    throw err;
  }
}

/**
 * Fetch admin by ID from database
 * @param {number} adminId - Admin ID
 * @returns {Promise<Object|null>} Admin object or null
 */
export async function getAdminById(adminId) {
  try {
    const result = await queryDatabase(
      'SELECT id, username, email, role, is_active, created_at, last_login FROM admins WHERE id = $1 AND is_active = true',
      [adminId]
    );
    
    return result.rows[0] || null;
  } catch (err) {
    console.error('Error fetching admin by ID:', err);
    throw err;
  }
}

/**
 * Update admin last login timestamp
 * @param {number} adminId - Admin ID
 * @param {string} ipAddress - Login IP address
 * @returns {Promise<void>}
 */
export async function updateAdminLastLogin(adminId, ipAddress) {
  try {
    await queryDatabase(
      'UPDATE admins SET last_login = CURRENT_TIMESTAMP, last_login_ip = $1, failed_login_attempts = 0 WHERE id = $1',
      [ipAddress, adminId]
    );
  } catch (err) {
    console.error('Error updating last login:', err);
    throw err;
  }
}

/**
 * Record failed login attempt
 * @param {string} username - Admin username
 * @param {string} ipAddress - Attempted login IP
 * @returns {Promise<number>} Number of failed attempts
 */
export async function recordFailedLogin(username, ipAddress) {
  try {
    const result = await queryDatabase(
      `UPDATE admins 
       SET failed_login_attempts = failed_login_attempts + 1,
           last_failed_login = CURRENT_TIMESTAMP 
       WHERE username = $1 
       RETURNING failed_login_attempts`,
      [username]
    );
    
    return result.rows[0]?.failed_login_attempts || 0;
  } catch (err) {
    console.error('Error recording failed login:', err);
    throw err;
  }
}

/**
 * Log admin activity for audit trail
 * @param {Object} logData - Activity log data
 * @returns {Promise<Object>} Created log entry
 */
export async function logAdminActivity(logData) {
  try {
    const {
      adminId,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress,
      userAgent
    } = logData;
    
    const result = await queryDatabase(
      `INSERT INTO admin_audit_logs 
       (admin_id, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [adminId, action, resourceType, resourceId, details || null, ipAddress, userAgent]
    );
    
    return result.rows[0];
  } catch (err) {
    console.error('Error logging admin activity:', err);
    throw err;
  }
}

/**
 * Get audit logs for an admin
 * @param {number} adminId - Admin ID
 * @param {number} limit - Number of logs to fetch (default: 50)
 * @returns {Promise<Array>} Array of audit log entries
 */
export async function getAdminAuditLogs(adminId, limit = 50) {
  try {
    const result = await queryDatabase(
      `SELECT * FROM admin_audit_logs 
       WHERE admin_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [adminId, limit]
    );
    
    return result.rows;
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    throw err;
  }
}

/**
 * Get all admin activity logs (for super admin)
 * @param {number} limit - Number of logs to fetch (default: 100)
 * @returns {Promise<Array>} Array of audit log entries
 */
export async function getAllAdminAuditLogs(limit = 100) {
  try {
    const result = await queryDatabase(
      `SELECT al.*, a.username FROM admin_audit_logs al
       LEFT JOIN admins a ON al.admin_id = a.id
       ORDER BY al.created_at DESC 
       LIMIT $1`,
      [limit]
    );
    
    return result.rows;
  } catch (err) {
    console.error('Error fetching all audit logs:', err);
    throw err;
  }
}

/**
 * Create new admin user
 * @param {Object} adminData - Admin creation data
 * @returns {Promise<Object>} Created admin object
 */
export async function createAdmin(adminData) {
  try {
    const { username, email, passwordHash, role = 'admin' } = adminData;
    
    const result = await queryDatabase(
      `INSERT INTO admins (username, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, role, created_at`,
      [username, email, passwordHash, role, true]
    );
    
    return result.rows[0];
  } catch (err) {
    if (err.code === '23505') {
      throw new Error('Username or email already exists');
    }
    console.error('Error creating admin:', err);
    throw err;
  }
}

/**
 * Update admin information
 * @param {number} adminId - Admin ID to update
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated admin object
 */
export async function updateAdmin(adminId, updateData) {
  try {
    const { email, role, isActive } = updateData;
    
    const result = await queryDatabase(
      `UPDATE admins 
       SET email = COALESCE($1, email),
           role = COALESCE($2, role),
           is_active = COALESCE($3, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, username, email, role, is_active, updated_at`,
      [email || null, role || null, isActive !== undefined ? isActive : null, adminId]
    );
    
    return result.rows[0];
  } catch (err) {
    console.error('Error updating admin:', err);
    throw err;
  }
}

/**
 * Delete (deactivate) an admin
 * @param {number} adminId - Admin ID to delete
 * @returns {Promise<Object>} Deleted admin object
 */
export async function deleteAdmin(adminId) {
  try {
    const result = await queryDatabase(
      `UPDATE admins 
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, username, email, is_active`,
      [adminId]
    );
    
    return result.rows[0];
  } catch (err) {
    console.error('Error deleting admin:', err);
    throw err;
  }
}

/**
 * List all admins (active only)
 * @returns {Promise<Array>} Array of admin objects
 */
export async function listAdmins() {
  try {
    const result = await queryDatabase(
      `SELECT id, username, email, role, is_active, created_at, last_login 
       FROM admins 
       WHERE is_active = true
       ORDER BY created_at DESC`,
      []
    );
    
    return result.rows;
  } catch (err) {
    console.error('Error listing admins:', err);
    throw err;
  }
}

/**
 * Update admin password
 * @param {number} adminId - Admin ID
 * @param {string} newPasswordHash - New bcrypt password hash
 * @returns {Promise<Object>} Updated admin object
 */
export async function updateAdminPassword(adminId, newPasswordHash) {
  try {
    const result = await queryDatabase(
      `UPDATE admins 
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, username, email, role, updated_at`,
      [newPasswordHash, adminId]
    );
    
    return result.rows[0];
  } catch (err) {
    console.error('Error updating password:', err);
    throw err;
  }
}
