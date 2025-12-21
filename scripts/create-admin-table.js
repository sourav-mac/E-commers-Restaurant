#!/usr/bin/env node

/**
 * Database Migration Script: Create Admins Table
 * 
 * This script creates the admins table in the PostgreSQL database.
 * Run this ONCE when setting up the admin system.
 * 
 * Usage:
 *   node scripts/create-admin-table.js
 * 
 * Requires:
 *   - DATABASE_URL environment variable set
 *   - PostgreSQL database running
 *   - Node.js 14+
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createAdminTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Creating admins table...');
    
    // Create admins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        last_login_ip VARCHAR(45),
        failed_login_attempts INTEGER DEFAULT 0,
        last_failed_login TIMESTAMP
      );
    `);
    
    console.log('✅ Admins table created successfully!');
    
    // Create indexes for performance
    console.log('🔧 Creating indexes...');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);
    `);
    
    console.log('✅ Indexes created successfully!');
    
    // Create admin audit log table
    console.log('🔧 Creating admin_audit_logs table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER REFERENCES admins(id),
        action VARCHAR(50) NOT NULL,
        resource_type VARCHAR(50),
        resource_id VARCHAR(100),
        details TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Admin audit logs table created successfully!');
    
    // Create index for audit logs
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_admin_id ON admin_audit_logs(admin_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_created_at ON admin_audit_logs(created_at);
    `);
    
    console.log('✅ Audit log indexes created successfully!');
    
    console.log('\n📝 Next steps:');
    console.log('1. Create the first admin user:');
    console.log('   node scripts/create-admin-user.js --username admin --email admin@petuk.com');
    console.log('\n2. Start using the admin panel!');
    
  } catch (err) {
    console.error('❌ Error creating table:', err);
    process.exit(1);
  } finally {
    await client.end();
    await pool.end();
  }
}

createAdminTable();
