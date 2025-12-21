# ✅ Security System Deployment Checklist

## Pre-Deployment Setup

### Environment Variables
- [ ] Add `JWT_SECRET` to `.env.local` (generate strong random string)
  ```bash
  # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Verify `TWILIO_ACCOUNT_SID` set
- [ ] Verify `TWILIO_AUTH_TOKEN` set
- [ ] Verify `TWILIO_PHONE_NUMBER` set
- [ ] Verify `ADMIN_PHONE` set

### Dependencies Check
- [ ] All required npm packages installed
- [ ] No console errors on startup
- [ ] Database/JSON files readable and writable

### Security Files
- [ ] `lib/otp.js` exists (180 lines)
- [ ] `lib/jwt.js` exists (90 lines)
- [ ] `lib/authMiddleware.js` exists (160 lines)
- [ ] `pages/auth/login.js` exists (300 lines)
- [ ] `pages/api/auth/send-otp.js` exists
- [ ] `pages/api/auth/verify-otp.js` exists
- [ ] `pages/api/auth/logout.js` exists
- [ ] `pages/secure-my-orders.js` exists
- [ ] `pages/secure-track-order.js` exists
- [ ] `pages/api/orders/my-orders.js` exists

### API Updates
- [ ] `pages/api/orders/[order_id]/cancel.js` updated (with authMiddleware)
- [ ] `pages/api/reservations/[id]/cancel.js` updated (with authMiddleware)
- [ ] `pages/my-orders.js` redirects to `/secure-my-orders`

---

## Testing Before Deploy

### Authentication Tests
- [ ] OTP login works end-to-end
- [ ] SMS delivery working (or dev mode shows OTP)
- [ ] Token stored in HTTP-only cookie
- [ ] Token also in localStorage
- [ ] Logout clears both tokens

### Security Tests
- [ ] User can only see their own orders
- [ ] User cannot cancel other users' orders (403)
- [ ] User cannot view other users' orders (403)
- [ ] Invalid token rejected (401)
- [ ] Expired token redirected to login
- [ ] OTP rate limiting works (429)
- [ ] Brute force protection works (5 attempts)

### Integration Tests
- [ ] Orders page loads after login
- [ ] Can view own orders list
- [ ] Can click "View Details" → track order
- [ ] Can cancel order (if status allows)
- [ ] Admin system still works (separate auth)
- [ ] Old `/my-orders` redirects correctly

### Performance Tests
- [ ] Login page loads < 1s
- [ ] OTP send < 2s
- [ ] OTP verify < 2s
- [ ] Orders fetch < 3s
- [ ] No N+1 queries
- [ ] No memory leaks

---

## Deployment Steps

### Step 1: Backup
```bash
# Backup current data
cp data/orders.json data/orders.json.backup
cp data/data.json data/data.json.backup
cp data/otp.json data/otp.json.backup
```

### Step 2: Deploy Code
```bash
# Pull latest code
git pull origin main

# Or manually copy files from this implementation

# Verify no syntax errors
npm run build  # or next build
```

### Step 3: Environment Setup
```bash
# Add to .env.local
JWT_SECRET=<strong-random-string>

# Verify all env vars
npm start  # Check for errors
```

### Step 4: Test in Staging
- [ ] Run full test checklist (see below)
- [ ] Test with real SMS if possible
- [ ] Test with multiple users simultaneously
- [ ] Test on mobile browser
- [ ] Test logout and re-login

### Step 5: Monitor
```bash
# Watch server logs
tail -f server.log | grep -E "\[SECURITY\]|\[ERROR\]|\[WARNING\]"

# Key log patterns to watch:
# ✅ [AUTH] Authenticated user
# ❌ [SECURITY] UNAUTHORIZED ATTEMPT
# 🚨 [ERROR] Any unexpected errors
```

---

## Production Deployment Checklist

### Security Hardening
- [ ] HTTPS enabled (SSL certificate)
- [ ] Secure flag enabled in cookies (requires HTTPS)
- [ ] Rate limiting enabled at reverse proxy
- [ ] CORS configured properly
- [ ] CSP headers set
- [ ] JWT_SECRET is strong (32+ chars, random)
- [ ] JWT_SECRET is NOT in git (use .env only)
- [ ] No debug mode in production

### Monitoring Setup
- [ ] Logging service configured
- [ ] Error alerts configured
- [ ] Security event alerts configured
- [ ] SMS delivery monitoring
- [ ] Database backup scheduled

### User Communication
- [ ] Update instructions (if needed)
- [ ] Notify users about new login requirement
- [ ] Provide FAQ/help documentation
- [ ] Customer support team trained

### Rollback Plan
- [ ] Backup of previous code
- [ ] Backup of all data
- [ ] Rollback procedure documented
- [ ] Quick rollback command ready

---

## Post-Deployment Verification

### Immediate After Deploy (Day 1)
- [ ] Users can login with OTP
- [ ] Orders accessible after login
- [ ] No 500 errors in logs
- [ ] SMS delivery working
- [ ] Performance acceptable
- [ ] No unauthorized access attempts in logs

### Day 2-7 Monitoring
- [ ] No security incidents reported
- [ ] User feedback positive
- [ ] Error rate stable
- [ ] Database file size stable
- [ ] SMS costs as expected
- [ ] Token expiry working (users re-login after 7 days)

### Week 2+ Operations
- [ ] Monitor daily logs for [SECURITY] events
- [ ] Track failed login attempts
- [ ] Monitor API performance
- [ ] Collect user feedback
- [ ] Plan enhancements

---

## Rollback Procedure

If critical issues found:

### Immediate Rollback
```bash
# Revert code
git revert <commit>
# or
git checkout previous-branch

# Restore data backup
cp data/orders.json.backup data/orders.json

# Restart server
npm start
```

### When to Rollback
- 🚨 Users cannot login
- 🚨 Users see other users' orders
- 🚨 Major database corruption
- 🚨 SMS service down (consider delay instead)
- 🚨 Repeated 5xx errors

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| OTP not received | Check Twilio config, check SMS credits |
| "Token expired" error on new login | Verify JWT_SECRET hasn't changed |
| Users can see other users' orders | Verify middleware installed correctly |
| API returns 401 | Check token expiry, recommend re-login |
| Performance degradation | Check database file size, optimize queries |
| Memory leak | Check Node.js heap, restart server daily |

---

## Monitoring Dashboard Setup

### Key Metrics to Track
```
- Login attempts per day
- Successful logins per day
- Failed login attempts per day
- [SECURITY] UNAUTHORIZED attempts
- OTP rate limit triggers
- Token expiry rate (weekly spikes normal)
- Order cancellations per day
- Average response time (should be < 200ms)
- Error rate (should be < 1%)
```

### Alert Thresholds
```
- More than 10 failed logins in 5 minutes → Alert
- More than 5 [SECURITY] events in 5 minutes → Alert
- Response time > 1000ms → Alert
- Error rate > 5% → Alert
- Database file > 100MB → Warning
```

---

## Support & Help

### If Users Report Issues
1. Check server logs for [SECURITY] or [ERROR]
2. Verify JWT_SECRET correct
3. Check Twilio credentials
4. Verify database readable
5. Restart server if needed

### If Security Concern
1. Immediately check logs for unauthorized attempts
2. Review recent access patterns
3. Clear compromised sessions if needed
4. Update JWT_SECRET if possible
5. Force all users to re-login if critical

### Escalation Path
- Tier 1: Check logs and verify configuration
- Tier 2: Review recent code changes
- Tier 3: Contact technical team for database review

---

## Post-Deployment Optimization (Optional)

After 1 week of stable operation:

### Performance Optimization
- [ ] Cache frequently accessed orders
- [ ] Implement query pagination
- [ ] Add database indexes on phone field
- [ ] Monitor and optimize slow queries

### Feature Additions
- [ ] Add email notifications (in addition to SMS)
- [ ] Add password recovery for admin
- [ ] Add login history page for users
- [ ] Add activity logging

### Security Enhancements
- [ ] Add rate limiting at reverse proxy
- [ ] Add IP-based security rules
- [ ] Implement CSRF tokens
- [ ] Add device fingerprinting
- [ ] Add suspicious activity alerts

---

## Documentation

- [ ] Share SECURITY_IMPLEMENTATION_GUIDE.md with team
- [ ] Share SECURITY_TESTING_GUIDE.md with QA
- [ ] Share SECURITY_QUICK_REFERENCE.md with support
- [ ] Create runbook for operations team
- [ ] Create troubleshooting guide for support

---

## Sign-Off

### Developer Sign-Off
- [ ] Code reviewed ___________
- [ ] Tests passed ___________
- [ ] Security verified ___________
- [ ] Date: ___________

### QA Sign-Off
- [ ] All tests passed ___________
- [ ] No regressions found ___________
- [ ] Security tests validated ___________
- [ ] Date: ___________

### Operations Sign-Off
- [ ] Deployment plan reviewed ___________
- [ ] Rollback plan confirmed ___________
- [ ] Monitoring configured ___________
- [ ] Date: ___________

---

## Deployment Complete! 🎉

Once all checkboxes are complete:

✅ Petuk system is **production-ready**
✅ Users can **securely login with OTP**
✅ Orders are **completely protected**
✅ Unauthorized access is **prevented and logged**
✅ System is **fully backward compatible**

**Go live with confidence!**
