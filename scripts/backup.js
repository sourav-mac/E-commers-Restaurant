#!/usr/bin/env node

/**
 * Automated Database Backup Script
 * Usage: node scripts/backup.js
 * Or via cron: 0 2 * * * node /path/to/scripts/backup.js
 */

require('dotenv').config({ path: '.env.local' });
const { createDatabaseBackup, uploadBackupToS3, cleanOldBackups } = require('../lib/backup');

async function runBackup() {
  console.log('🔄 Starting automated backup...\n');
  
  try {
    // Step 1: Create backup
    console.log('📝 Creating database backup...');
    const backupPath = await createDatabaseBackup();
    console.log(`✓ Backup created: ${backupPath}\n`);

    // Step 2: Upload to S3
    console.log('☁️ Uploading to S3...');
    const s3Key = await uploadBackupToS3(backupPath);
    console.log(`✓ Upload complete: ${s3Key}\n`);

    // Step 3: Cleanup old backups
    console.log('🧹 Cleaning up old backups...');
    await cleanOldBackups();
    console.log('✓ Cleanup complete\n');

    // Success notification
    console.log('✅ Backup completed successfully!');
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    
    // Log to file
    const fs = require('fs').promises;
    const logMessage = `[${new Date().toISOString()}] ✅ Backup successful - ${s3Key}\n`;
    await fs.appendFile('logs/backup.log', logMessage).catch(() => {});
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    
    // Log error
    const fs = require('fs').promises;
    const errorLog = `[${new Date().toISOString()}] ❌ Backup failed - ${error.message}\n`;
    await fs.appendFile('logs/backup-errors.log', errorLog).catch(() => {});
    
    process.exit(1);
  }
}

runBackup();
