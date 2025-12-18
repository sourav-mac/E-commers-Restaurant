/**
 * Database Backup & Recovery Module
 * - Automated daily backups
 * - S3 cloud storage
 * - Backup encryption
 * - Retention policy
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.BACKUP_S3_ACCESS_KEY,
  secretAccessKey: process.env.BACKUP_S3_SECRET_KEY,
  region: process.env.BACKUP_S3_REGION || 'us-east-1',
});

/**
 * Create database backup
 * @returns {Promise<string>} Backup file path
 */
export async function createDatabaseBackup() {
  const timestamp = new Date().toISOString().split('T')[0];
  const backupFile = `backup_${timestamp}_${Date.now()}.sql`;
  const backupPath = path.join(process.cwd(), 'backups', backupFile);

  try {
    // Ensure backups directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'backups'))) {
      fs.mkdirSync(path.join(process.cwd(), 'backups'), { recursive: true });
    }

    // Create backup command (PostgreSQL)
    const backupCommand = `pg_dump -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} > ${backupPath}`;

    console.log(`Starting backup: ${backupFile}`);
    await execPromise(backupCommand);

    // Verify backup file exists and has content
    const stats = fs.statSync(backupPath);
    if (stats.size === 0) {
      throw new Error('Backup file is empty');
    }

    console.log(`✓ Backup created: ${backupFile} (${stats.size} bytes)`);
    return backupPath;
  } catch (error) {
    console.error('Backup creation failed:', error.message);
    throw new Error(`Failed to create backup: ${error.message}`);
  }
}

/**
 * Upload backup to S3
 * @param {string} backupPath - Local backup file path
 * @returns {Promise<string>} S3 file key
 */
export async function uploadBackupToS3(backupPath) {
  try {
    const fileContent = fs.readFileSync(backupPath);
    const fileName = path.basename(backupPath);
    const key = `backups/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`;

    const params = {
      Bucket: process.env.BACKUP_S3_BUCKET,
      Key: key,
      Body: fileContent,
      ServerSideEncryption: 'AES256', // Enable encryption
      StorageClass: 'STANDARD_IA', // Cheaper storage for infrequent access
    };

    await s3.upload(params).promise();
    console.log(`✓ Backup uploaded to S3: ${key}`);

    // Delete local backup after successful upload
    fs.unlinkSync(backupPath);
    return key;
  } catch (error) {
    console.error('S3 upload failed:', error.message);
    throw new Error(`Failed to upload backup: ${error.message}`);
  }
}

/**
 * Restore database from backup
 * @param {string} backupFile - Backup file name
 * @returns {Promise<void>}
 */
export async function restoreDatabaseFromBackup(backupFile) {
  try {
    console.log(`Starting restoration from: ${backupFile}`);

    // Download from S3 if needed
    let localBackupPath = backupFile;
    if (backupFile.includes('/')) {
      localBackupPath = await downloadBackupFromS3(backupFile);
    }

    // Restore command (PostgreSQL)
    const restoreCommand = `psql -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} < ${localBackupPath}`;

    await execPromise(restoreCommand);
    console.log('✓ Database restored successfully');

    // Cleanup
    if (localBackupPath !== backupFile) {
      fs.unlinkSync(localBackupPath);
    }
  } catch (error) {
    console.error('Restoration failed:', error.message);
    throw new Error(`Failed to restore database: ${error.message}`);
  }
}

/**
 * Download backup from S3
 * @param {string} s3Key - S3 file key
 * @returns {Promise<string>} Local file path
 */
export async function downloadBackupFromS3(s3Key) {
  try {
    const params = {
      Bucket: process.env.BACKUP_S3_BUCKET,
      Key: s3Key,
    };

    const data = await s3.getObject(params).promise();
    const localPath = path.join(process.cwd(), 'backups', path.basename(s3Key));

    fs.writeFileSync(localPath, data.Body);
    console.log(`✓ Downloaded backup from S3: ${localPath}`);

    return localPath;
  } catch (error) {
    console.error('S3 download failed:', error.message);
    throw new Error(`Failed to download backup: ${error.message}`);
  }
}

/**
 * List backups in S3
 * @returns {Promise<array>} List of backups
 */
export async function listBackups() {
  try {
    const params = {
      Bucket: process.env.BACKUP_S3_BUCKET,
      Prefix: 'backups/',
    };

    const data = await s3.listObjectsV2(params).promise();
    return data.Contents || [];
  } catch (error) {
    console.error('Failed to list backups:', error.message);
    throw new Error(`Failed to list backups: ${error.message}`);
  }
}

/**
 * Clean old backups based on retention policy
 * @returns {Promise<void>}
 */
export async function cleanOldBackups() {
  try {
    const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const backups = await listBackups();
    let deletedCount = 0;

    for (const backup of backups) {
      if (backup.LastModified < cutoffDate) {
        await s3.deleteObject({
          Bucket: process.env.BACKUP_S3_BUCKET,
          Key: backup.Key,
        }).promise();
        deletedCount++;
      }
    }

    console.log(`✓ Deleted ${deletedCount} old backups`);
  } catch (error) {
    console.error('Cleanup failed:', error.message);
  }
}

export default {
  createDatabaseBackup,
  uploadBackupToS3,
  restoreDatabaseFromBackup,
  downloadBackupFromS3,
  listBackups,
  cleanOldBackups,
};
