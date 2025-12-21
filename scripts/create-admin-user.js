#!/usr/bin/env node

/**
 * Admin User Creation Script
 * 
 * Creates a new admin user in the database.
 * 
 * Usage:
 *   node scripts/create-admin-user.js --username admin --email admin@petuk.com
 * 
 * Requires:
 *   - DATABASE_URL environment variable
 *   - Admin table created (run create-admin-table.js first)
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Parse command line arguments
const args = process.argv.slice(2);
const argObj = {};
for (let i = 0; i < args.length; i += 2) {
  argObj[args[i].replace('--', '')] = args[i + 1];
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

function promptPassword(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    let password = '';

    process.stdin.on('data', (char) => {
      if (char === '\n' || char === '\r' || char === '\u0004') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write('\n');
        resolve(password);
      } else if (char === '\u0003') {
        process.exit();
      } else if (char === '\u007f') {
        password = password.slice(0, -1);
      } else {
        password += char;
      }
    });
  });
}

async function createAdminUser() {
  try {
    console.log('\n📝 Admin User Creation\n');
    
    const username = argObj.username || await prompt('Username: ');
    const email = argObj.email || await prompt('Email: ');
    const password = await promptPassword('Password: ');
    const confirmPassword = await promptPassword('Confirm Password: ');
    
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match!');
      process.exit(1);
    }
    
    if (password.length < 16) {
      console.log('❌ Password must be at least 16 characters!');
      console.log('📋 Requirements:');
      console.log('   - At least 16 characters');
      console.log('   - Contains uppercase letters');
      console.log('   - Contains lowercase letters');
      console.log('   - Contains numbers');
      console.log('   - Contains special characters (!@#$%^&*)');
      process.exit(1);
    }
    
    // Validate password strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      console.log('❌ Password does not meet requirements!');
      console.log('📋 Requirements:');
      console.log(`   ${hasUpperCase ? '✅' : '❌'} Uppercase letters (A-Z)`);
      console.log(`   ${hasLowerCase ? '✅' : '❌'} Lowercase letters (a-z)`);
      console.log(`   ${hasNumbers ? '✅' : '❌'} Numbers (0-9)`);
      console.log(`   ${hasSpecialChar ? '✅' : '❌'} Special characters (!@#$%^&*)`);
      process.exit(1);
    }
    
    // Hash password
    console.log('\n🔐 Hashing password (this may take a moment)...');
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Insert into database
    const client = await pool.connect();
    try {
      console.log('💾 Creating admin user...');
      
      const result = await client.query(
        `INSERT INTO admins (username, email, password_hash, role, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, username, email, role, created_at;`,
        [username, email, passwordHash, 'admin', true]
      );
      
      const admin = result.rows[0];
      
      console.log('\n✅ Admin user created successfully!\n');
      console.log('📊 Admin Details:');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Created: ${admin.created_at}`);
      
      console.log('\n🚀 You can now login with:');
      console.log(`   Username: ${username}`);
      console.log(`   Password: (the password you just entered)`);
      
    } catch (err) {
      if (err.code === '23505') {
        console.log('❌ Username or email already exists!');
      } else {
        console.log('❌ Error creating admin:', err.message);
      }
      process.exit(1);
    } finally {
      await client.end();
    }
    
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
    process.exit(0);
  }
}

createAdminUser();
