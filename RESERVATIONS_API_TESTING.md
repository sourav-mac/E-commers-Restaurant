# API Testing Guide - Reservations Feature

## Overview
This guide shows how to test the reservations system using curl, Postman, or any API testing tool.

---

## 1. Create a Reservation

### Endpoint
```
POST /api/reserve
```

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "date": "2025-12-20",
  "time": "19:00",
  "size": "4",
  "note": "Window seat preferred, celebrating anniversary"
}
```

### curl Example
```bash
curl -X POST http://localhost:3000/api/reserve \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "9876543210",
    "date": "2025-12-20",
    "time": "19:00",
    "size": "4",
    "note": "Window seat preferred"
  }'
```

### Response (Success)
```json
{
  "success": true,
  "message": "Your table is booked. We will call to confirm.",
  "reservation": {
    "id": "a1b2c3d4",
    "name": "John Doe",
    "phone": "+919876543210",
    "originalPhone": "9876543210",
    "date": "2025-12-20",
    "time": "19:00",
    "size": "4",
    "note": "Window seat preferred",
    "status": "pending",
    "createdAt": "2025-12-15T10:30:00.000Z"
  }
}
```

### What Happens:
- ✅ Reservation saved to database
- ✅ SMS sent to customer (booking confirmation)
- ✅ SMS sent to admin (alert)
- ✅ Status set to "pending"

---

## 2. Fetch All Reservations (Admin)

### Endpoint
```
GET /api/admin/orders
```

### Request Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### curl Example
```bash
curl -X GET http://localhost:3000/api/admin/orders \
  -H "Authorization: Bearer your_jwt_token_here"
```

### Response (Success)
```json
{
  "success": true,
  "orders": [...],
  "reservations": [
    {
      "id": "a1b2c3d4",
      "name": "John Doe",
      "phone": "+919876543210",
      "originalPhone": "9876543210",
      "date": "2025-12-20",
      "time": "19:00",
      "size": "4",
      "note": "Window seat preferred",
      "status": "pending",
      "createdAt": "2025-12-15T10:30:00.000Z"
    }
  ]
}
```

### Error Responses:
```json
// Unauthorized (no token or invalid token)
{
  "error": "Unauthorized"
}
```

---

## 3. Accept a Reservation

### Endpoint
```
PATCH /api/admin/reservations/{reservation_id}
```

### Request Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### URL Parameters
- `reservation_id`: The reservation ID from the booking (e.g., "a1b2c3d4")

### Request Body
```json
{
  "status": "accepted"
}
```

### curl Example
```bash
curl -X PATCH http://localhost:3000/api/admin/reservations/a1b2c3d4 \
  -H "Authorization: Bearer your_jwt_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accepted"
  }'
```

### Response (Success)
```json
{
  "success": true,
  "message": "Reservation accepted",
  "reservation": {
    "id": "a1b2c3d4",
    "name": "John Doe",
    "phone": "+919876543210",
    "originalPhone": "9876543210",
    "date": "2025-12-20",
    "time": "19:00",
    "size": "4",
    "note": "Window seat preferred",
    "status": "accepted",
    "createdAt": "2025-12-15T10:30:00.000Z",
    "updatedAt": "2025-12-15T10:35:00.000Z"
  },
  "smsNotified": true
}
```

### What Happens:
- ✅ Status changed to "accepted"
- ✅ `updatedAt` timestamp set
- ✅ SMS sent to customer:
  ```
  ✅ Your Petuk reservation has been CONFIRMED!
  Reservation ID: a1b2c3d4
  Date: 2025-12-20
  Time: 19:00
  Party Size: 4
  We look forward to serving you!
  ```

---

## 4. Cancel a Reservation

### Endpoint
```
PATCH /api/admin/reservations/{reservation_id}
```

### Request Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Body
```json
{
  "status": "cancelled"
}
```

### curl Example
```bash
curl -X PATCH http://localhost:3000/api/admin/reservations/a1b2c3d4 \
  -H "Authorization: Bearer your_jwt_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "cancelled"
  }'
```

### Response (Success)
```json
{
  "success": true,
  "message": "Reservation cancelled",
  "reservation": {
    "id": "a1b2c3d4",
    "name": "John Doe",
    "phone": "+919876543210",
    "originalPhone": "9876543210",
    "date": "2025-12-20",
    "time": "19:00",
    "size": "4",
    "note": "Window seat preferred",
    "status": "cancelled",
    "createdAt": "2025-12-15T10:30:00.000Z",
    "updatedAt": "2025-12-15T10:40:00.000Z"
  },
  "smsNotified": true
}
```

### What Happens:
- ✅ Status changed to "cancelled"
- ✅ `updatedAt` timestamp set
- ✅ SMS sent to customer:
  ```
  ❌ Your Petuk reservation (ID: a1b2c3d4) for 2025-12-20 at 19:00 has been CANCELLED.
  Please contact us for more information.
  Phone: [ADMIN_PHONE]
  ```

---

## 5. Test SMS Endpoint

### Endpoint
```
POST /api/test-sms
```

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "phone": "9876543210",
  "message": "Test message from Petuk"
}
```

### curl Example
```bash
curl -X POST http://localhost:3000/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "message": "Test message from Petuk"
  }'
```

### Response (Success)
```json
{
  "success": true,
  "message": "SMS sent successfully",
  "sid": "SM1234567890abcdef",
  "to": "+919876543210"
}
```

### Response (Failure)
```json
{
  "success": false,
  "error": "Invalid phone number format"
}
```

---

## Error Codes & Responses

### 400 Bad Request
```json
{
  "error": "Invalid status"
}
```
- Happens when status is not "accepted" or "cancelled"
- Or when required fields are missing

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```
- Happens when JWT token is missing or invalid
- Or when token is expired

### 404 Not Found
```json
{
  "error": "Reservation not found"
}
```
- Happens when reservation ID doesn't exist

### 405 Method Not Allowed
```json
{
  "error": "Method not allowed"
}
```
- Happens when using wrong HTTP method (e.g., GET instead of POST)

### 500 Server Error
```json
{
  "error": "Failed to update reservation"
}
```
- Happens when database write fails
- Or when SMS sending fails (but still updates database)

---

## Getting JWT Token for Admin Endpoints

### Login Endpoint
```
POST /api/admin/login
```

### Request Body
```json
{
  "password": "your_admin_password"
}
```

### Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin"
}
```

### Use This Token
Use the token in the `Authorization` header for all admin API calls:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Testing Workflow

### Step-by-Step Test:
1. **Create reservation** using POST `/api/reserve`
   - Check if SMS received on phone
   - Check if reservation appears in admin panel
   
2. **Accept reservation** using PATCH `/api/admin/reservations/{id}`
   - Check if status changed to "accepted" in database
   - Check if acceptance SMS received
   
3. **Cancel reservation** using POST to create new one, then PATCH to cancel
   - Check if cancellation SMS received
   - Check if status changed to "cancelled"

---

## Postman Collection Template

Save this as a Postman collection:

```json
{
  "info": {
    "name": "Petuk Reservations API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Reservation",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": {"raw": "http://localhost:3000/api/reserve", "protocol": "http", "host": ["localhost"], "port": ["3000"], "path": ["api", "reserve"]},
        "body": {
          "mode": "raw",
          "raw": "{\"name\": \"John Doe\", \"phone\": \"9876543210\", \"date\": \"2025-12-20\", \"time\": \"19:00\", \"size\": \"4\", \"note\": \"\"}"
        }
      }
    },
    {
      "name": "Get All Reservations",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer TOKEN_HERE"}],
        "url": {"raw": "http://localhost:3000/api/admin/orders", "protocol": "http", "host": ["localhost"], "port": ["3000"], "path": ["api", "admin", "orders"]}
      }
    },
    {
      "name": "Accept Reservation",
      "request": {
        "method": "PATCH",
        "header": [{"key": "Authorization", "value": "Bearer TOKEN_HERE"}, {"key": "Content-Type", "value": "application/json"}],
        "url": {"raw": "http://localhost:3000/api/admin/reservations/a1b2c3d4", "protocol": "http", "host": ["localhost"], "port": ["3000"], "path": ["api", "admin", "reservations", "a1b2c3d4"]},
        "body": {"mode": "raw", "raw": "{\"status\": \"accepted\"}"}
      }
    },
    {
      "name": "Cancel Reservation",
      "request": {
        "method": "PATCH",
        "header": [{"key": "Authorization", "value": "Bearer TOKEN_HERE"}, {"key": "Content-Type", "value": "application/json"}],
        "url": {"raw": "http://localhost:3000/api/admin/reservations/a1b2c3d4", "protocol": "http", "host": ["localhost"], "port": ["3000"], "path": ["api", "admin", "reservations", "a1b2c3d4"]},
        "body": {"mode": "raw", "raw": "{\"status\": \"cancelled\"}"}
      }
    },
    {
      "name": "Test SMS",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": {"raw": "http://localhost:3000/api/test-sms", "protocol": "http", "host": ["localhost"], "port": ["3000"], "path": ["api", "test-sms"]},
        "body": {"mode": "raw", "raw": "{\"phone\": \"9876543210\", \"message\": \"Test message\"}"}
      }
    }
  ]
}
```

---

## Data Validation Rules

### Phone Number
- Can be 10 digits (Indian): `9876543210`
- Will be auto-formatted to: `+919876543210`
- Must be numeric (no letters, spaces, or special chars except + and -)

### Date Format
- Must be ISO format: `YYYY-MM-DD`
- Example: `2025-12-20`

### Time Format
- Must be 24-hour format: `HH:MM`
- Example: `19:00` (7:00 PM)

### Party Size
- Must be a number 1-20
- Can be string `"4"` or number `4`

### Reservation ID
- 8 character alphanumeric string
- Generated automatically by UUID
- Example: `a1b2c3d4`

---

## Common Issues & Solutions

### Issue: 401 Unauthorized on admin endpoints
**Solution:** 
- Login first to get JWT token
- Include token in Authorization header
- Check token hasn't expired

### Issue: SMS not received
**Solution:**
- Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in `.env.local`
- Check TWILIO_PHONE_NUMBER is set
- Use `/api/test-sms` to test SMS functionality
- Check phone number format (should include country code)

### Issue: Reservation not appearing in admin list
**Solution:**
- Create new reservation and check response
- Verify reservation was saved (check `data/orders.json`)
- Refresh admin page
- Check status filter isn't hiding it
- Check search term isn't filtering it out

### Issue: "Reservation not found" error when updating
**Solution:**
- Get correct reservation ID from `/api/admin/orders`
- Check spelling of ID
- Make sure reservation exists before updating
- Check database file isn't corrupted

---

## Debugging Tips

### 1. Check Server Logs
Watch the terminal running Next.js:
```
✅ Reservation created: a1b2c3d4
✅ Reservation a1b2c3d4 accepted, SMS sent to +919876543210
```

### 2. Check Database File
Look at `data/orders.json`:
```bash
# PowerShell
Get-Content data/orders.json | ConvertFrom-Json | Select-Object -ExpandProperty reservations
```

### 3. Test SMS Independently
Use the test endpoint:
```bash
curl -X POST http://localhost:3000/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "message": "Test"}'
```

### 4. Monitor Network Requests
In browser DevTools → Network tab:
- Check request/response headers
- Verify Content-Type is application/json
- Check response status codes
- Look for error messages in response body

### 5. Enable Verbose Logging
Add logging to APIs for debugging:
```javascript
console.log('Request body:', req.body);
console.log('Database before:', allData);
console.log('Database after:', allData);
```

---

## Performance Notes

- Typical response time: < 500ms
- SMS delivery: Usually within 1-2 seconds
- Database operations: < 100ms
- API calls from browser: 200-500ms depending on network

---

**Last Updated:** December 15, 2025
**Version:** 1.0
