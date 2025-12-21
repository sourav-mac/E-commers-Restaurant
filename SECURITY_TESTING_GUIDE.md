# 🧪 Security System Testing Guide

## Quick Start Testing

### **Test 1: Login Flow (5 min)**

**Goal:** Verify OTP authentication works

```
1. Navigate to http://localhost:3000/my-orders
2. Should redirect to http://localhost:3000/auth/login
3. Enter phone: 9999999999
4. Click "Send OTP"
   ✓ Should see: "OTP sent to your phone"
   ✓ In dev mode: Should show OTP in UI (e.g., "OTP: 123456")
5. Enter the OTP shown (or received via SMS in production)
6. Click "Verify OTP"
   ✓ Should redirect to http://localhost:3000/secure-my-orders
   ✓ Should see: "Logged in as: +919999999999"
```

---

### **Test 2: Order Access Control (10 min)**

**Goal:** Verify users can ONLY see their own orders

#### **Setup:**
Create 2 test orders:
- Order 1: Phone 9999999999
- Order 2: Phone 8888888888

#### **Test:**
```
1. Login as user 9999999999
2. Go to /secure-my-orders
3. Should see: Order 1 ONLY (not Order 2)
4. Call API directly: GET /api/orders/my-orders
   ✓ Response contains only orders for 9999999999
   ✓ Does NOT contain orders for 8888888888

5. Logout
6. Login as user 8888888888
7. Go to /secure-my-orders
8. Should see: Order 2 ONLY (not Order 1)
9. Call API directly: GET /api/orders/my-orders
   ✓ Response contains only orders for 8888888888
   ✓ Does NOT contain orders for 9999999999
```

---

### **Test 3: Unauthorized Access Prevention (10 min)**

**Goal:** Verify users CANNOT access/modify other users' orders

#### **Test 3A: Try to Cancel Another User's Order**

```
1. Login as user 9999999999
2. Note an order ID that belongs to 8888888888 (e.g., "ORD-888-123")
3. Try to cancel it via API:

curl -X POST http://localhost:3000/api/orders/ORD-888-123/cancel \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Test"}'

Expected Response (403 FORBIDDEN):
{
  "error": "Unauthorized: This order does not belong to you",
  "message": "You cannot cancel someone else's order"
}

✓ Cancellation BLOCKED
✓ Order status NOT changed
✓ Admin receives NO cancellation SMS
✓ Check server logs for: [SECURITY] UNAUTHORIZED ATTEMPT
```

#### **Test 3B: Try to View Another User's Order Details**

```
1. Login as user 9999999999
2. Query for 8888888888's order:

curl -X POST http://localhost:3000/api/orders/ORD-888-123 \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"phone": "8888888888"}'

Expected Response (403 FORBIDDEN or 404):
{
  "error": "Order not found"
}

✓ Order data NOT returned
✓ Cannot see other users' order details
```

---

### **Test 4: Token Security (5 min)**

**Goal:** Verify tokens are secure and expire properly

#### **Test 4A: Token Expiration**
```
1. Login and get token
2. Manually set token expiry date to past:
   localStorage.setItem('auth_token', '<old-expired-token>')
3. Try to access /secure-my-orders
   ✓ Should redirect to /auth/login
   ✓ Error: "Token expired"

Server logs:
✓ ⏰ [AUTH] Token expired. Logging out...
```

#### **Test 4B: Invalid Token**
```
1. Try to access API with fake token:

curl -X GET http://localhost:3000/api/orders/my-orders \
  -H "Authorization: Bearer invalid-token-12345"

Expected Response (401):
{
  "error": "Unauthorized"
}

✓ Fake token REJECTED
✓ Cannot access protected routes
```

#### **Test 4C: Token in HTTP-Only Cookie**
```
1. Login successfully
2. In browser console:
   console.log(document.cookie)
   
Expected: auth_token=<jwt-token> (HttpOnly flag set)
✓ Token is NOT readable from JavaScript
✓ XSS attacks cannot steal token
```

---

### **Test 5: Logout & Session End (5 min)**

**Goal:** Verify logout clears authentication

```
1. Login as user 9999999999
2. Click "Logout" button
   ✓ Should redirect to /auth/login
   ✓ localStorage should be cleared:
     - localStorage.getItem('auth_token') = null
     - localStorage.getItem('user_phone') = null
3. Try to access /secure-my-orders directly
   ✓ Should redirect to /auth/login (not authenticated)
4. Try to call API:

curl -X GET http://localhost:3000/api/orders/my-orders

Expected (401 UNAUTHORIZED):
{
  "error": "Unauthorized"
}

✓ Session completely cleared
```

---

### **Test 6: OTP Security (10 min)**

**Goal:** Verify OTP constraints work

#### **Test 6A: Rate Limiting**
```
1. Request OTP for phone 9999999999
   ✓ Response: "OTP sent"
2. Immediately request OTP again for same phone
   Expected Response (429):
   {
     "error": "Rate limited. Please wait before requesting another OTP"
   }
   
✓ Cannot spam OTP requests
```

#### **Test 6B: Brute Force Protection**
```
1. Get valid OTP
2. Try 5 wrong OTPs in a row:
   - POST /api/auth/verify-otp with wrong code each time
   Expected after 5 attempts:
   {
     "error": "Too many verification attempts. Please request a new OTP."
   }

✓ After 5 attempts, locked out
✓ Must request new OTP to continue
```

#### **Test 6C: OTP Expiry**
```
1. Request OTP for phone 9999999999
2. Wait 10+ minutes
3. Try to verify OTP

Expected (400):
{
  "error": "OTP has expired. Please request a new one."
}

✓ OTP expires after 10 minutes
```

---

### **Test 7: Phone Number Normalization (5 min)**

**Goal:** Verify different phone formats work correctly

```
Users with different phone formats should be same person:
- 9999999999
- +919999999999
- (999) 999-9999
- +91-999-999-9999

1. Signup/Login with format: 9999999999
2. Later login with format: +919999999999
3. Should be SAME user (see same orders)

Backend normalizes to last 10 digits for comparison:
✓ Last 10 digits must match for ownership
✓ Format variations don't matter
```

---

## 🔍 Server Log Verification

### **Expected Logs on Success:**

```
Login attempt:
✅ [OTP] OTP generated: 123456
✅ [SMS] OTP sent to 9999999999
✅ [OTP] OTP verified successfully for user 9999999999
✅ [JWT] Token generated for phone: 9999999999
✅ [AUTH] Authenticated user: +919999999999
```

### **Expected Logs on Security Event:**

```
Unauthorized access attempt:
🚨 [SECURITY] UNAUTHORIZED ATTEMPT: User 9999999999 tried to cancel order 
            belonging to 8888888888
❌ [CANCEL] Request rejected: 403 Forbidden
```

---

## 🧩 Test Scenarios

### **Scenario 1: Normal User Flow**
```
Alice → Login → View own orders → Cancel own order → Logout
✓ Works perfectly
```

### **Scenario 2: Security Attack Prevention**
```
Alice (9999) → Try to cancel Bob's order (8888)
✓ Request blocked with 403 Forbidden
✓ Order NOT cancelled
✓ Admin NOT notified
✓ Security log recorded
```

### **Scenario 3: Session Hijacking Prevention**
```
Eve (hacker) → Steal token from Alice
         → Try to cancel Bob's order with Alice's token
✓ Fails: Order belongs to Bob, not Alice
✓ Token is valid (Alice's) but ownership check fails
✓ Request blocked with 403 Forbidden
```

### **Scenario 4: Token Forgery Prevention**
```
Mallory (hacker) → Generate fake JWT token
              → Try to use to access API
✓ Token signature verification fails
✓ Request blocked with 401 Unauthorized
✓ No access granted
```

---

## 📊 Performance Checks

```
✓ Login page load: < 1 second
✓ OTP send API: < 2 seconds
✓ OTP verify API: < 2 seconds
✓ My Orders page load: < 3 seconds
✓ Cancel order: < 2 seconds

All should use normal network speeds
```

---

## ✅ Complete Test Checklist

- [ ] Login with OTP works
- [ ] Users see only their own orders
- [ ] Cannot access other users' orders
- [ ] Cannot cancel other users' orders
- [ ] Token expires after 7 days
- [ ] Expired token redirects to login
- [ ] Invalid token rejected
- [ ] Logout clears session
- [ ] OTP rate limited (1 per minute)
- [ ] OTP brute force protected (5 attempts max)
- [ ] OTP expires after 10 minutes
- [ ] Phone normalization works (multiple formats)
- [ ] Unauthorized attempts logged
- [ ] HTTP-only cookies set correctly
- [ ] No tokens in localStorage leak
- [ ] SMS notifications working
- [ ] Admin dashboard still works (separate auth)

---

## 🆘 Troubleshooting

### **Issue: OTP not arriving**

**Solution:**
- Check Twilio configuration in `.env.local`
- Verify SMS provider account has credits
- In development mode, OTP shown in UI

### **Issue: "Token Expired" on fresh login**

**Solution:**
- Check JWT_SECRET in `.env.local`
- Verify system time is correct
- Try deleting cookies and logging in again

### **Issue: 403 Forbidden when accessing own order**

**Solution:**
- Ensure phone number matches exactly
- Try different phone formats (+91 vs without)
- Check backend logs for ownership verification

### **Issue: Logout not working**

**Solution:**
- Check browser console for errors
- Clear localStorage manually
- Verify logout API is accessible

---

## 📞 Support

If tests fail:
1. Check server logs for [ERROR] or [SECURITY] tags
2. Verify `.env.local` has all required variables
3. Check JWT_SECRET is set and matches
4. Verify Twilio credentials are correct
5. Ensure database/JSON files are readable

All security features are production-ready! 🎉
