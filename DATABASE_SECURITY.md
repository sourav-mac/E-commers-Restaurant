# 🔐 DATABASE SECURITY IMPLEMENTATION GUIDE

## Overview

This document outlines the complete security implementation for the Petuk Restaurant E-commerce system. All requirements follow industry best practices and OWASP guidelines.

---

## ✅ Security Checklist

### 1. ✓ Secure Database Credentials

**Implementation:**
- All credentials stored in `.env.local` (never committed to Git)
- `.env.example` provided as template
- Environment variables validated at startup

**Files:**
- `.env.local` - Sensitive credentials (DO NOT COMMIT)
- `.env.example` - Template for developers

**How to use:**
```bash
# Copy template
cp .env.example .env.local

# Fill with your actual credentials
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=petuk_restaurant
DB_USER=petuk_app_user
DB_PASSWORD=strong-password-here
```

---

### 2. ✓ Strong Password & Restricted User

**Database User Permissions (PostgreSQL):**

```sql
-- Create restricted application user
CREATE USER petuk_app_user WITH PASSWORD 'your-strong-password';

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE petuk_restaurant TO petuk_app_user;
GRANT USAGE ON SCHEMA public TO petuk_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO petuk_app_user;

-- No administrative permissions
-- petuk_app_user cannot: DROP, ALTER, CREATE, TRUNCATE
```

**Password Requirements:**
- Minimum 16 characters
- Must include: uppercase, lowercase, numbers, special characters
- Change every 90 days
- Never reuse previous 5 passwords

---

### 3. ✓ Disable Public Database Access

**Network Configuration:**

### PostgreSQL (Port 5432)

**AWS Security Group Rules:**
```
Inbound Rules:
- PostgreSQL (5432): Allow only from [App Server IP]
- SSH (22): Allow only from [Admin IP]

Outbound Rules:
- All (0.0.0.0/0): Allow
```

**Firewall Settings:**
```bash
# Linux/Ubuntu
sudo ufw allow from [app-server-ip] to any port 5432

# Block public access
sudo ufw deny 5432
```

**Connection String (NEVER allow 0.0.0.0/0):**
```
# ✓ Correct: Restricted access
Server IP: 192.168.1.100
DB Host: 192.168.1.50

# ✗ Wrong: Public access
DB Host: 0.0.0.0
```

---

### 4. ✓ Use Parameterized Queries

**Secure Database Module:** `lib/secureDb.js`

**Example Usage:**

```javascript
import { queryDatabase } from '@/lib/secureDb';

// ✓ CORRECT: Parameterized query
const result = await queryDatabase(
  'SELECT * FROM orders WHERE id = $1',
  [orderId]
);

// ✓ CORRECT: Multiple parameters
const result = await queryDatabase(
  'SELECT * FROM users WHERE email = $1 AND status = $2',
  [email, 'active']
);

// ✗ WRONG: String concatenation (SQL INJECTION!)
const result = await query(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

**Features:**
- Automatically sanitizes input
- Prevents SQL injection
- Error handling without exposing sensitive info

---

### 5. ✓ Enable SSL/TLS for DB Connection

**Configuration in `lib/secureDb.js`:**

```javascript
ssl: process.env.DB_SSL === 'true' ? {
  rejectUnauthorized: true,
  ca: process.env.DB_CA_CERT || undefined
} : false,
```

**For Production:**
```bash
# PostgreSQL with SSL (certificate-based)
DB_HOST=db.example.com
DB_PORT=5432
DB_SSL=true
DB_CA_CERT=/path/to/ca-certificate.pem
```

**Verification:**
```sql
-- Check SSL status
SHOW ssl;
-- Should output: on

-- Test connection
psql -h db.example.com -U petuk_app_user \
  -d petuk_restaurant \
  --set=sslmode=require
```

---

### 6. ✓ Daily Automatic Backups

**Backup Module:** `lib/backup.js`

**Features:**
- Automated daily backups
- Cloud storage (AWS S3)
- Encryption at rest
- Retention policy (30 days default)
- Point-in-time recovery

**Setup:**

1. **Install AWS CLI:**
```bash
npm install aws-sdk
```

2. **Configure Environment:**
```bash
BACKUP_S3_BUCKET=your-backup-bucket
BACKUP_S3_REGION=us-east-1
BACKUP_S3_ACCESS_KEY=your_key
BACKUP_S3_SECRET_KEY=your_secret
BACKUP_RETENTION_DAYS=30
```

3. **Create Cron Job (Linux):**
```bash
# Edit crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * node /path/to/petuk/scripts/backup.js

# Weekly backup at 3 AM
0 3 * * 0 node /path/to/petuk/scripts/backup.js
```

4. **S3 Bucket Configuration:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/backup" },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-backup-bucket",
        "arn:aws:s3:::your-backup-bucket/*"
      ]
    }
  ]
}
```

**Backup Schedule:**
- Daily: 7 daily backups (auto-delete after 7 days)
- Weekly: 4 weekly backups (auto-delete after 4 weeks)
- Monthly: 3 monthly backups (auto-delete after 3 months)

**Restore Example:**
```javascript
import { restoreDatabaseFromBackup } from '@/lib/backup';

// Restore from S3
await restoreDatabaseFromBackup('backups/2024/12/backup_2024-12-19.sql');
```

---

### 7. ✓ Monitor & Log Critical Events

**Logging Levels:**
- `INFO` - Normal operations
- `WARN` - Unusual but not critical
- `ERROR` - System failures
- `CRITICAL` - Security threats

**Events Logged:**
- ✓ Failed login attempts
- ✓ SQL errors
- ✓ Unauthorized access attempts
- ✓ Database connection failures
- ✓ Backup success/failure
- ✓ Payment verification
- ✓ Admin actions

**Log File Location:**
```
logs/
├── app.log          # Application logs
├── security.log     # Security events
├── payment.log      # Payment events
└── admin.log        # Admin actions
```

**Log Rotation:**
```javascript
// Use morgan + winston for professional logging
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/security.log' 
    }),
  ],
});
```

**Sanitization Rules:**
- Never log passwords
- Never log API keys
- Never log payment card numbers
- Never log personal identifying information (PII)

---

### 8. ✓ Rate Limiting for Sensitive Queries

**Rate Limiter Module:** `lib/rateLimiter.js`

**Endpoints Protected:**
- Login: 5 attempts / 15 minutes
- Payment verification: 10 attempts / 1 minute
- User registration: 5 accounts / 1 hour
- General API: 100 requests / 15 minutes

**Usage in API Routes:**

```javascript
import { loginLimiter, paymentLimiter } from '@/lib/rateLimiter';

// Apply to login endpoint
export default function handler(req, res) {
  return loginLimiter(req, res, () => {
    // Handle login
  });
}

// Apply to payment endpoint
export default function handler(req, res) {
  return paymentLimiter(req, res, () => {
    // Handle payment
  });
}
```

---

### 9. ✓ Implement Database Encryption

**Encryption Levels:**

#### A. Encryption at Rest (Database Level)

**PostgreSQL Encryption:**
```sql
-- Check if SSL is enabled
SHOW ssl;

-- Enable force SSL
ALTER SYSTEM SET ssl = on;
SELECT pg_reload_conf();
```

#### B. Encryption at Transit (Connection Level)

Already configured in `lib/secureDb.js`:
```javascript
ssl: { rejectUnauthorized: true }
```

#### C. Application-Level Encryption

For sensitive fields:

```javascript
import crypto from 'crypto';

export function encryptField(value, secret) {
  const cipher = crypto.createCipher('aes-256-cbc', secret);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decryptField(encrypted, secret) {
  const decipher = crypto.createDecipher('aes-256-cbc', secret);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Usage
const encryptedPhone = encryptField(userPhone, process.env.ENCRYPTION_SECRET);
```

**Fields to Encrypt:**
- Phone numbers
- Addresses
- Payment methods
- Customer emails (optional)

#### D. Password Security

Implemented in `lib/auth.js`:
```javascript
// Passwords are hashed with bcrypt (one-way)
const hash = await hashPassword(password);
// Never store plain text passwords!
```

---

### 10. ✓ Regular Vulnerability Scanning

**Automated Weekly Scans:**

1. **NPM Audit (Dependencies)**
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# In package.json
"scripts": {
  "audit": "npm audit",
  "audit:fix": "npm audit fix"
}
```

2. **OWASP ZAP (Application)**
```bash
# Docker scan
docker run -t owasp/zap2docker-stable:latest \
  zap-full-scan.py -t http://localhost:3000
```

3. **SonarQube (Code Quality)**
```bash
npm install sonarqube-scanner --save-dev

# Run scan
npm run sonarqube
```

4. **Database Security Check**
```sql
-- Find weak permissions
SELECT grantee, privilege_type 
FROM information_schema.table_privileges 
WHERE table_schema NOT IN ('pg_catalog', 'information_schema');

-- Check user permissions
\du
```

**Scan Schedule (Crontab):**
```bash
# Weekly security scan (Sunday 2 AM)
0 2 * * 0 npm audit && echo "NPM audit complete"

# Monthly vulnerability report
0 3 1 * * /opt/security-scan.sh
```

---

## 📊 Deployment Checklist

Before going live, verify:

- [ ] Environment variables configured
- [ ] Database user created with restricted permissions
- [ ] SSL/TLS enabled for DB connection
- [ ] Firewall rules restricting DB access
- [ ] Backup system tested and working
- [ ] Logging configured
- [ ] Rate limiting active
- [ ] Password hashing implemented
- [ ] All dependencies up-to-date
- [ ] Security headers added
- [ ] Admin credentials changed
- [ ] Razorpay test keys replaced with production keys

---

## 🚨 Emergency Response

### If Credentials Are Exposed:

1. **Immediate (Within 5 minutes):**
   - Revoke all API keys
   - Change database password
   - Reset admin credentials
   - Check for unauthorized access in logs

2. **Short-term (Within 1 hour):**
   - Restore from clean backup
   - Audit all transactions
   - Notify users if needed
   - Update firewall rules

3. **Long-term:**
   - Review security logs
   - Implement fixes
   - Security training
   - Update documentation

---

## 📞 Support & Contact

For security issues:
- 📧 Email: mandalsourav026@gmail.com
- 🐛 Report Issues: [GitHub Issues](https://github.com/sourav-mac/E-commers-Restaurant/issues)
- ⚠️ Security Hotline: +91 9832358231

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-syntax.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [AWS S3 Security](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security.html)

---

Last Updated: December 19, 2025
