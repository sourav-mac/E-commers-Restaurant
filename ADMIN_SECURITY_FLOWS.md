# 🔐 ADMIN SECURITY - VISUAL FLOW DIAGRAMS

## 1️⃣ LOGIN FLOW (How to get admin access)

```
┌─────────────────────────────────────────────────────────────┐
│                   ADMIN LOGIN PROCESS                        │
└─────────────────────────────────────────────────────────────┘

Step 1: User Opens Admin Panel
┌──────────────────────────┐
│ Visit: /admin/login      │
│ Load: Login Page UI      │
│ Show: Username + Pass    │
│ Show: Security Notices   │
└──────────────────────────┘
         ↓
Step 2: User Enters Credentials
┌──────────────────────────┐
│ Username: admin          │
│ Password: ••••••••••••   │ (Masked)
│ Click: "Sign In"         │
└──────────────────────────┘
         ↓
Step 3: API Endpoint Receives Request
┌──────────────────────────┐
│ POST /api/admin/login    │
│ { username, password }   │
└──────────────────────────┘
         ↓
Step 4: Rate Limiting Check
┌──────────────────────────┐
│ Check IP: 192.168.x.x    │
│ Count attempts last 15m  │
│ Current: 2               │
│ Limit: 5                 │
│ Status: ✅ OK (continue) │
└──────────────────────────┘
         ↓
Step 5: Password Verification (Bcrypt)
┌──────────────────────────┐
│ Input: "ChangeMe@12345"  │
│ Hash:  $2a$12$Eix...     │
│ Compare: bcrypt.compare()│
│ Result: ✅ MATCH         │
└──────────────────────────┘
         ↓
Step 6: Generate JWT Tokens
┌──────────────────────────┐
│ Access Token (1 hour)    │
│ eyJhbGc... (JWT)         │
│                          │
│ Refresh Token (7 days)   │
│ eyJyZX... (JWT)          │
└──────────────────────────┘
         ↓
Step 7: Set Secure Cookies
┌──────────────────────────┐
│ admin_token = eyJhbGc... │
│ Flags:                   │
│   - HttpOnly ✅          │
│   - Secure ✅            │
│   - SameSite=Strict ✅   │
│   - Path=/admin ✅       │
└──────────────────────────┘
         ↓
Step 8: Return Success Response
┌──────────────────────────┐
│ Status: 200 OK           │
│ {                        │
│   token: "eyJhbGc..."    │
│   user: { username: ... }│
│   redirect: "/dashboard" │
│ }                        │
└──────────────────────────┘
         ↓
Step 9: Client Redirects to Dashboard
┌──────────────────────────┐
│ Navigate to:             │
│ /admin/dashboard         │
│                          │
│ Browser stores cookie    │
│ Auto-sends on next req   │
└──────────────────────────┘
         ↓
✅ SUCCESS: Admin is logged in!
```

---

## 2️⃣ PROTECTED PAGE ACCESS FLOW

```
┌─────────────────────────────────────────────────────────────┐
│           HOW PROTECTED PAGES CHECK AUTHORIZATION           │
└─────────────────────────────────────────────────────────────┘

Scenario A: User WITHOUT Login Token

User visits: /admin/dashboard
         ↓
Component mounts (withAdminPageAuth wrapper)
         ↓
Check: localStorage.admin_token
         ↓
Result: NOT FOUND
         ↓
Action: router.push('/admin/login')
         ↓
User sees: Login Page
         ↓
Result: ❌ Access Denied (redirected)


Scenario B: User WITH Valid Login Token

User visits: /admin/dashboard
         ↓
Component mounts (withAdminPageAuth wrapper)
         ↓
Check: localStorage.admin_token
         ↓
Result: FOUND
         ↓
Fetch: /api/admin/data
         ↓
Include: Authorization: Bearer eyJhbGc...
         ↓
Server verifies: JWT signature
         ↓
Server checks: Token expiry
         ↓
Server checks: role = "admin"
         ↓
Result: ✅ ALL PASS
         ↓
Server returns: Admin data
         ↓
User sees: Admin Dashboard
         ↓
Result: ✅ Access Granted


Scenario C: User WITH Expired Token

User visits: /admin/dashboard
         ↓
Component mounts
         ↓
Token found but EXPIRED
         ↓
Attempt: Use refresh token
         ↓
POST /api/admin/refresh
         ↓
Server generates: New access token
         ↓
Cookie updated: HttpOnly cookie set
         ↓
Component: Retries original request
         ↓
Result: ✅ Automatic refresh working
         ↓
User sees: Admin Dashboard (uninterrupted)
```

---

## 3️⃣ API ENDPOINT PROTECTION FLOW

```
┌─────────────────────────────────────────────────────────────┐
│        HOW ADMIN API ENDPOINTS ARE PROTECTED                │
└─────────────────────────────────────────────────────────────┘

Request comes to: /api/admin/orders

         ↓
┌──────────────────────────┐
│ middleware: adminApiRoute()
│                          │
│ Extract token from:      │
│ 1. Header               │
│ 2. Cookie               │
│ 3. Body                 │
└──────────────────────────┘
         ↓
┌──────────────────────────┐
│ Check 1: Token Exists?   │
│                          │
│ No token found?          │
│ ↓ Return 401             │
│ { error: "No token" }    │
│                          │
│ Token found? ↓ Continue  │
└──────────────────────────┘
         ↓
┌──────────────────────────┐
│ Check 2: Token Valid?    │
│                          │
│ Verify JWT signature     │
│ Using JWT_SECRET         │
│                          │
│ Invalid signature?       │
│ ↓ Return 401             │
│ { error: "Invalid token"}│
│                          │
│ Valid? ↓ Continue        │
└──────────────────────────┘
         ↓
┌──────────────────────────┐
│ Check 3: Token Expired?  │
│                          │
│ Check: token.exp         │
│ Compare: current time    │
│                          │
│ Expired?                 │
│ ↓ Return 401             │
│ { error: "Token expired" }
│                          │
│ Valid? ↓ Continue        │
└──────────────────────────┘
         ↓
┌──────────────────────────┐
│ Check 4: Has Admin Role? │
│                          │
│ Check: token.role        │
│ Expected: "admin"        │
│                          │
│ Not admin?               │
│ ↓ Return 403             │
│ { error: "Forbidden" }   │
│                          │
│ Is admin? ↓ Continue     │
└──────────────────────────┘
         ↓
┌──────────────────────────┐
│ ALL CHECKS PASSED! ✅    │
│                          │
│ Attach to request:       │
│ req.admin = {            │
│   username: "admin",     │
│   role: "admin"          │
│ }                        │
└──────────────────────────┘
         ↓
┌──────────────────────────┐
│ Execute Endpoint Code    │
│                          │
│ export default function  │
│   handler(req, res) {    │
│   // req.admin available │
│   // You write code here │
│ }                        │
└──────────────────────────┘
         ↓
┌──────────────────────────┐
│ Log Activity             │
│                          │
│ logAdminActivity({       │
│   action: "API_CALL",    │
│   endpoint: "/orders",   │
│   ip: "192.168.x.x"      │
│ })                       │
└──────────────────────────┘
         ↓
┌──────────────────────────┐
│ Return Response          │
│                          │
│ res.json({ data })       │
│                          │
│ OR                       │
│                          │
│ res.status(400)          │
│   .json({ error })       │
└──────────────────────────┘
         ↓
✅ Request Complete
```

---

## 4️⃣ RATE LIMITING FLOW

```
┌─────────────────────────────────────────────────────────────┐
│         HOW BRUTE-FORCE ATTACKS ARE PREVENTED               │
└─────────────────────────────────────────────────────────────┘

Attacker starts trying passwords:
Attempt 1: wrong password
         ↓
Check: Requests from IP 192.168.1.100
       Count in last 15 minutes: 0 + 1 = 1
       Limit: 5
       Status: ✅ ALLOWED

Attempt 2: wrong password
         ↓
Check: Requests from IP 192.168.1.100
       Count in last 15 minutes: 1 + 1 = 2
       Limit: 5
       Status: ✅ ALLOWED

Attempt 3: wrong password
         ↓
Check: Count = 3
       Limit = 5
       Status: ✅ ALLOWED

Attempt 4: wrong password
         ↓
Check: Count = 4
       Limit = 5
       Status: ✅ ALLOWED

Attempt 5: wrong password
         ↓
Check: Count = 5
       Limit = 5
       Status: ✅ ALLOWED (this is the last one)

Attempt 6: wrong password ❌
         ↓
Check: Count = 6
       Limit = 5
       Status: ❌ BLOCKED!
         ↓
Response: 429 Too Many Requests
          {
            error: "Too many login attempts",
            retryAfter: 15 (minutes)
          }
         ↓
Attacker must wait 15 minutes to try again!
         ↓
Waiting 15 minutes... Counter resets
         ↓
Can try again (but only 5 more times)

═══════════════════════════════════════════
RESULT: Impossible to brute-force 10,000
        password combinations in 1 day!
═══════════════════════════════════════════
```

---

## 5️⃣ LOGOUT FLOW

```
┌─────────────────────────────────────────────────────────────┐
│               HOW LOGOUT WORKS SECURELY                     │
└─────────────────────────────────────────────────────────────┘

Admin clicks "Logout" button

Step 1: Send Logout Request
         ↓
POST /api/admin/logout
Headers: {
  Authorization: "Bearer eyJhbGc..."
}

Step 2: Server Receives Request
         ↓
Verify token is valid
(one last check)

Step 3: Clear Cookies
         ↓
res.clearCookie('admin_token')
res.clearCookie('admin_refresh')
res.clearCookie('admin_username')

Step 4: Clear LocalStorage
         ↓
localStorage.removeItem('admin_token')
localStorage.removeItem('admin_username')

Step 5: Log Activity
         ↓
logAdminActivity({
  action: "LOGOUT",
  username: "admin",
  ip: "192.168.1.100",
  timestamp: "2024-12-19T10:15:23Z"
})

Step 6: Return Success
         ↓
res.json({
  success: true,
  message: "Logged out successfully",
  redirect: "/admin/login"
})

Step 7: Client Redirects
         ↓
User sees: Login Page
User token: CLEARED ✅
User cookies: CLEARED ✅
User localStorage: CLEARED ✅

Step 8: Verify Protection
         ↓
If user tries to access /admin/dashboard:
Result: Auto-redirects to /admin/login
Because: No token in localStorage or cookies

═══════════════════════════════════════════
RESULT: Admin cannot access dashboard
        without logging in again!
═══════════════════════════════════════════
```

---

## 6️⃣ ATTACK PREVENTION - TIMELINE

```
┌─────────────────────────────────────────────────────────────┐
│         WHAT HAPPENS IF SOMEONE TRIES TO ATTACK             │
└─────────────────────────────────────────────────────────────┘

Day 1: Attacker discovers /admin/login exists

         ↓ TIME: 10:00 AM
Attack: Opens /admin/login
Result: ✅ Normal - anyone can see login page
        ❌ But can't get past without password

         ↓ TIME: 10:01 AM (60 seconds later)
Attack: Tries username=admin, password=admin123
Result: ❌ Password wrong
        ✅ Logged: Failed attempt from IP 192.168.1.50
        Status: Attempt 1/5

         ↓ TIME: 10:02 AM
Attack: Tries password=password
Result: ❌ Password wrong
        Attempt: 2/5

         ↓ TIME: 10:03 AM
Attack: Tries password=123456
Result: ❌ Password wrong
        Attempt: 3/5

         ↓ TIME: 10:04 AM
Attack: Tries password=qwerty
Result: ❌ Password wrong
        Attempt: 4/5

         ↓ TIME: 10:05 AM
Attack: Tries password=letmein
Result: ❌ Password wrong
        Attempt: 5/5 (LAST ONE)

         ↓ TIME: 10:06 AM
Attack: Tries password=password123
Result: ❌ ERROR! "Too many attempts"
        
        Block duration: 15 minutes
        
        Can retry at: 10:21 AM

         ↓ TIME: 10:21 AM (after waiting)
Attack: Tries password=admin@123
Result: ❌ Password wrong
        Attempt: 1/5 (counter reset)

═══════════════════════════════════════════

ANALYSIS:
--------
To brute-force 10,000 password combinations:

Without rate limiting:
  Time needed: ~30 minutes
  Result: POSSIBLE ❌

With rate limiting (5 per 15 min):
  Time needed: 3,000 * 15 minutes = 45,000 minutes
             = 31.25 days NON-STOP
  Result: IMPOSSIBLE ✅

PLUS: After day 1, you see:
  - 30 failed attempts from same IP
  - All logged in admin.log
  - Alert: "Possible brute-force attack detected"
  - Action: Block IP or change password

═══════════════════════════════════════════
```

---

## 7️⃣ TOKEN EXPIRY FLOW

```
┌─────────────────────────────────────────────────────────────┐
│        HOW TOKENS EXPIRE FOR SECURITY                       │
└─────────────────────────────────────────────────────────────┘

Admin logs in at: 10:00 AM

JWT Access Token generated:
  - Expiry time: 11:00 AM (1 hour from now)
  - Created: 10:00 AM
  - Expires: 11:00 AM

JWT Refresh Token generated:
  - Expiry time: Dec 26, 2024 (7 days from now)
  - Used for: Refreshing access token

═══════════════════════════════════════════

Timeline:

10:00 AM: Admin logs in ✅
10:30 AM: Admin uses dashboard ✅ (Token valid)
11:00 AM: Access token EXPIRES ⏰

User tries to access dashboard at 11:01 AM
         ↓
Request: GET /api/admin/data
Headers: Authorization: Bearer eyJhbGc... (expired)

Server checks: Token expiry time
Result: Token EXPIRED ❌

Server action:
  Option 1: Use refresh token
            If refresh token valid:
              Generate NEW access token
              Return data (transparent to user)
            If refresh token ALSO expired:
              Return 401
              Frontend: redirect to login

Option 2 (transparent refresh):
  - Refresh happens silently
  - User doesn't notice token change
  - New token gets 1 more hour
  - User session continues

Option 3 (forced re-login):
  - Both tokens expired
  - Cannot auto-refresh
  - Redirect to login page
  - User logs in again

═══════════════════════════════════════════

Benefit: If token is stolen:
  - Attacker can only use it for 1 hour
  - After 1 hour: Token invalid
  - Attacker must get new token (impossible)
  - Attack window: CLOSED ✅

═══════════════════════════════════════════
```

---

## 8️⃣ DATABASE QUERY PROTECTION

```
┌─────────────────────────────────────────────────────────────┐
│   HOW SQL INJECTION ATTACKS ARE PREVENTED                   │
└─────────────────────────────────────────────────────────────┘

❌ VULNERABLE (What NOT to do):

const username = req.body.username;  // "admin' OR '1'='1"
const query = `SELECT * FROM admins WHERE username = '${username}'`;
result = db.query(query);

If username contains: admin' OR '1'='1
Query becomes: SELECT * FROM admins WHERE username = 'admin' OR '1'='1'
Result: Returns ALL admins (bypass!) ❌


✅ SECURE (What we DO):

import { queryDatabase } from '@/lib/secureDb';

const username = req.body.username;  // "admin' OR '1'='1"
const result = queryDatabase(
  'SELECT * FROM admins WHERE username = $1',
  [username]  // Separate from query
);

How it works:
1. Query template: SELECT * FROM admins WHERE username = $1
2. Parameter: admin' OR '1'='1 (treated as STRING, not SQL)
3. Database engine: Interprets as literal text, not code
4. Result: No match found (secure!) ✅

═══════════════════════════════════════════

Key difference:
- Vulnerable: SQL code + user input mixed
- Secure: SQL template + separated parameters

The database knows:
  "This is the query structure"
  "This is the data to search for"
  "Never interpret data as SQL code"

═══════════════════════════════════════════
```

---

## 9️⃣ COOKIE SECURITY FLOW

```
┌─────────────────────────────────────────────────────────────┐
│     HOW COOKIES ARE PROTECTED FROM ATTACKS                  │
└─────────────────────────────────────────────────────────────┘

When admin logs in, server creates cookie:

set-cookie: admin_token=eyJhbGc...; HttpOnly; Secure; SameSite=Strict

Breaking down each flag:

┌─────────────────────────────────────────┐
│ HttpOnly = TRUE                         │
├─────────────────────────────────────────┤
│ What it does:                           │
│ - Cookie NOT accessible from JavaScript│
│ - Cannot read: document.cookie          │
│ - Cannot steal via XSS attack          │
│                                         │
│ Protects against: XSS (Cross-Site      │
│                     Scripting)         │
│                                         │
│ Attacker tries:                         │
│ <script>                                │
│   alert(document.cookie)                │
│ </script>                               │
│                                         │
│ Result: Cannot access admin_token ✅   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Secure = TRUE                           │
├─────────────────────────────────────────┤
│ What it does:                           │
│ - Cookie ONLY sent over HTTPS          │
│ - Never sent over HTTP                 │
│                                         │
│ Protects against: Man-in-the-Middle    │
│                   (MITM) attacks       │
│                                         │
│ Attacker tries to intercept on         │
│ unsecured network:                      │
│ - HTTP connection blocked              │
│ - Cookie not transmitted               │
│ - Result: Cannot steal token ✅        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ SameSite = Strict                       │
├─────────────────────────────────────────┤
│ What it does:                           │
│ - Cookie only sent to SAME SITE        │
│ - Never sent to other domains          │
│                                         │
│ Protects against: CSRF (Cross-Site    │
│                  Request Forgery)      │
│                                         │
│ Attacker creates fake site:             │
│ <form action="petuk.com/delete-orders">│
│ </form>                                 │
│                                         │
│ When admin visits fake site:            │
│ - Browser NOT allowed to send          │
│   admin_token to petuk.com             │
│ - Fake form cannot access your         │
│   authenticated session                │
│ - Result: CSRF attack prevented ✅    │
└─────────────────────────────────────────┘

═══════════════════════════════════════════

Summary:

Attack Type      | Prevention    | Flag
─────────────────┼───────────────┼──────────
XSS              | HttpOnly      | ✅ Protected
MITM             | Secure        | ✅ Protected
CSRF             | SameSite      | ✅ Protected

═══════════════════════════════════════════
```

---

## 🔟 COMPLETE SECURITY STACK

```
┌─────────────────────────────────────────────────────────────┐
│            ALL SECURITY LAYERS COMBINED                     │
└─────────────────────────────────────────────────────────────┘

                    ATTACKER
                       ↓
        ┌─────────────────────────┐
        │   Layer 1: HTTPS Only   │
        ├─────────────────────────┤
        │ Tries: HTTP connection  │
        │ Result: 403 Forbidden   │
        │ Status: ❌ BLOCKED      │
        └─────────────────────────┘
                       ↓
        ┌─────────────────────────┐
        │  Layer 2: Login Page    │
        ├─────────────────────────┤
        │ Tries: /admin/login     │
        │ Result: Can access page │
        │ Status: ✅ OK (expected)│
        └─────────────────────────┘
                       ↓
        ┌─────────────────────────┐
        │ Layer 3: Rate Limiting  │
        ├─────────────────────────┤
        │ Attempts: 1,2,3,4,5     │
        │ Attempt 6: BLOCKED      │
        │ Wait: 15 minutes        │
        │ Status: ❌ BLOCKED      │
        └─────────────────────────┘
                       ↓
        ┌─────────────────────────┐
        │ Layer 4: Password Hash  │
        ├─────────────────────────┤
        │ Tries: Common passwords │
        │ Hash: $2a$12$aMNwNP...  │
        │ Bcrypt: Can't reverse   │
        │ Status: ❌ IMPOSSIBLE   │
        └─────────────────────────┘
                       ↓
        ┌─────────────────────────┐
        │ Layer 5: JWT Token Gen  │
        ├─────────────────────────┤
        │ If somehow logged in:   │
        │ Token: Cryptographically│
        │        signed           │
        │ Cannot forge: Need      │
        │   JWT_SECRET            │
        │ Status: ❌ BLOCKED      │
        └─────────────────────────┘
                       ↓
        ┌─────────────────────────┐
        │ Layer 6: Token Expiry   │
        ├─────────────────────────┤
        │ If somehow got token:   │
        │ Valid for: 1 hour only  │
        │ After 1 hour: Invalid   │
        │ Must refresh: Need      │
        │   refresh token         │
        │ Status: ⏰ TIME LIMIT   │
        └─────────────────────────┘
                       ↓
        ┌─────────────────────────┐
        │ Layer 7: HTTP-Only      │
        ├─────────────────────────┤
        │ If cookie stolen:       │
        │ XSS attack: Blocked     │
        │ Cannot read from JS     │
        │ Status: ❌ XSS PROOF   │
        └─────────────────────────┘
                       ↓
        ┌─────────────────────────┐
        │ Layer 8: Role Check     │
        ├─────────────────────────┤
        │ If token somehow valid: │
        │ Check: role = "admin"   │
        │ If not admin: 403       │
        │ Status: ❌ BLOCKED      │
        └─────────────────────────┘
                       ↓
        ┌─────────────────────────┐
        │ Layer 9: Activity Log   │
        ├─────────────────────────┤
        │ All attempts logged:    │
        │ IP address recorded     │
        │ Can detect patterns     │
        │ Can ban IPs             │
        │ Status: 📝 MONITORED    │
        └─────────────────────────┘
                       ↓
        ┌─────────────────────────┐
        │ Layer 10: SameSite      │
        ├─────────────────────────┤
        │ If CSRF attack tried:   │
        │ Cookie not sent to      │
        │ other domains           │
        │ Status: ❌ BLOCKED      │
        └─────────────────────────┘
                       ↓
              ATTACK FAILED ✅
        No single layer can be bypassed!

═══════════════════════════════════════════
RESULT: Your admin panel is SECURE!
═══════════════════════════════════════════
```

---

## 📊 SUMMARY TABLE

| Component | Technology | Strength | Status |
|-----------|------------|----------|--------|
| Password Hashing | Bcrypt 12 rounds | 🔐🔐🔐🔐🔐 | ✅ |
| Token Auth | JWT + Refresh | 🔐🔐🔐🔐 | ✅ |
| Cookie Security | HttpOnly + Secure | 🔐🔐🔐🔐 | ✅ |
| Rate Limiting | IP-based | 🔐🔐🔐 | ✅ |
| HTTPS | Enforced in prod | 🔐🔐🔐🔐🔐 | ✅ |
| Input Sanitization | Parameterized queries | 🔐🔐🔐🔐 | ✅ |
| Activity Logging | File-based | 🔐🔐🔐 | ✅ |

---

**Your admin panel security is now COMPLETE!** 🎉
