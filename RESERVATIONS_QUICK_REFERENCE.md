# 🎪 Reservations Feature - Quick Reference Card

## 📍 Admin Panel Navigation

```
/admin/orders
    ↓
Find 2 tabs:
[📦 Food Orders] [🍽️ Table Reservations] ← Click This
    ↓
See all table reservations with details
```

---

## 🔄 Complete Workflow Visual

```
┌─────────────────────────────────────────────────────────┐
│                    CUSTOMER BOOKS TABLE                 │
│                  (via /reserve page)                    │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ↓                             ↓
    📱 Customer SMS             📱 Admin SMS
    "Booking Confirmed"         "New Reservation"
        │                            │
        └──────────────┬─────────────┘
                       │
        ✅ Reservation Saved (Status: PENDING)
        Stored in: data/orders.json → reservations[]
                       │
┌──────────────────────┴──────────────────────────────────┐
│               ADMIN REVIEWS RESERVATION                 │
│            (goes to /admin/orders page)                 │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        │ ADMIN CLICK               ADMIN CLICK
        │ "Accept"                  "Cancel"
        │ (Green Button)            (Red Button)
        ↓                             ↓
    Status: ACCEPTED             Status: CANCELLED
    Updated in DB                Updated in DB
        │                             │
        └──────────────┬─────────────┘
                       │
        ┌──────────────┴──────────────┐
        ↓                             ↓
    ✅ Acceptance SMS             ❌ Cancellation SMS
    "CONFIRMED"                   "CANCELLED"
    Full details:                 Contact info
    - ID, Date, Time, Size        - ID, Date, Time
        │                             │
        └──────────────┬─────────────┘
                       │
            📱 CUSTOMER NOTIFIED
            Ready to plan dinner!
```

---

## 🎯 Admin Actions Quick Map

```
CUSTOMER PHONE NUMBER
         │
         ├─→ 9876543210 (10 digits, Indian)
         └─→ +919876543210 (formatted for SMS)


RESERVATION APPEARS IN ADMIN
         │
    ┌────┴────┐
    │          │
STATUS: PENDING  STATUS: ACCEPTED   STATUS: CANCELLED
    │               │                   │
    ├─ Accept ✓     │                   │
    ├─ Cancel ✗     ├─ Cancel ✗        └─ View Only
    │               │
    ↓               ↓
 Status           Status
  ↓                ↓
ACCEPTED      CANCELLED
    │              │
 SMS ✅          SMS ❌
```

---

## 📋 Reservation Data Fields

```
Reservation {
  ✓ id          → "a1b2c3d4" (unique, 8 chars)
  ✓ name        → "John Doe"
  ✓ phone       → "+919876543210" (SMS format)
  ✓ originalPhone → "9876543210" (user input)
  ✓ date        → "2025-12-20" (YYYY-MM-DD)
  ✓ time        → "19:00" (HH:MM format)
  ✓ size        → "4" (party size)
  ✓ note        → "Window seat preferred"
  ✓ status      → "pending" | "accepted" | "cancelled"
  ✓ createdAt   → ISO timestamp
  ✓ updatedAt   → ISO timestamp (updated when status changes)
}
```

---

## 🟡 🟢 🔴 Status Color Guide

```
PENDING (Yellow)
├─ Means: Awaiting admin decision
├─ Action: Admin must Accept or Cancel
├─ Color: 🟡 Yellow (#EABA0C or #FFC107)
└─ SMS sent: Only initial booking confirmation

ACCEPTED (Green)
├─ Means: Admin has confirmed
├─ Action: Can still cancel if needed
├─ Color: 🟢 Green (#10B981)
└─ SMS sent: Confirmation with all details

CANCELLED (Red)
├─ Means: Admin cancelled or customer cancelled
├─ Action: No further actions
├─ Color: 🔴 Red (#EF4444)
└─ SMS sent: Cancellation notice
```

---

## 🔍 Search & Filter

```
┌─────────────────────────────────────┐
│ Search Bar (Top Left)               │
├─────────────────────────────────────┤
│ Find by:                            │
│ • Name: "John"                      │
│ • Phone: "9876543210"               │
│ • ID: "a1b2c3d4"                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Status Filter (Top Right)           │
├─────────────────────────────────────┤
│ Show:                               │
│ • All Statuses (default)            │
│ • Pending only                      │
│ • Accepted only                     │
│ • Cancelled only                    │
└─────────────────────────────────────┘
```

---

## 📱 SMS Message Templates

### BOOKING SMS (Auto-sent to customer)
```
🎯 Petuk Reservation Confirmed! 
Reservation ID: a1b2c3d4
Name: John Doe
Date: 2025-12-20
Time: 19:00
Party Size: 4
We will call to confirm. Thank you!
```

### ACCEPTANCE SMS (Sent when admin clicks Accept)
```
✅ Your Petuk reservation has been CONFIRMED!
Reservation ID: a1b2c3d4
Date: 2025-12-20
Time: 19:00
Party Size: 4
We look forward to serving you!
```

### CANCELLATION SMS (Sent when admin clicks Cancel)
```
❌ Your Petuk reservation (ID: a1b2c3d4) for 2025-12-20 at 19:00 has been CANCELLED.
Please contact us for more information.
Phone: [YOUR_ADMIN_PHONE]
```

---

## ⚡ Response Times

```
Action                          Time
─────────────────────────────────────
Create Reservation              < 1 second
Display in Admin                < 2 seconds
Accept/Cancel Reservation       < 1 second
SMS Delivery to Customer        1-2 seconds
─────────────────────────────────────
Total End-to-End               < 5 seconds
```

---

## 🔑 Key Concepts

### What is Status?
- **PENDING** = Customer booked, awaiting admin approval
- **ACCEPTED** = Admin confirmed, customer notified
- **CANCELLED** = Reservation rejected, customer notified

### When is SMS Sent?
1. ✅ **Booking** → Auto SMS to customer & admin
2. ✅ **Acceptance** → SMS to customer only
3. ✅ **Cancellation** → SMS to customer only

### Who Gets Notified?
- **Customer** → All 3 times (booking, accept/cancel)
- **Admin** → Only on new booking

### Where's the Data Stored?
- File: `data/orders.json`
- Array: `reservations[]`
- One entry per reservation

---

## 🎮 Step-by-Step Actions

### ACCEPT A RESERVATION
```
1. Go to /admin/orders
2. Click "🍽️ Table Reservations" tab
3. Find reservation with yellow badge
4. Click green button: "✓ Accept Reservation"
5. Wait for success message
6. Reservation now shows green badge: "✓ Accepted"
7. ✅ Customer receives SMS confirmation
```

### CANCEL A RESERVATION
```
1. Go to /admin/orders
2. Click "🍽️ Table Reservations" tab
3. Find the reservation
4. Click red button: "✕ Cancel Reservation"
5. Wait for success message
6. Reservation now shows red badge: "✕ Cancelled"
7. ✅ Customer receives SMS cancellation notice
```

### SEARCH FOR A RESERVATION
```
1. Go to /admin/orders
2. Click "🍽️ Table Reservations" tab
3. Type in search box (top left)
   - Customer name, or
   - Phone number, or
   - Reservation ID
4. Results filter instantly
5. Found it? Click buttons to manage
```

### FILTER BY STATUS
```
1. Go to /admin/orders
2. Click "🍽️ Table Reservations" tab
3. Use dropdown (top right): "All Statuses"
4. Select: Pending, Accepted, or Cancelled
5. Table updates to show only selected status
6. Click "All Statuses" to see everything again
```

---

## ⚠️ Important Notes

```
🚨 PHONE NUMBERS
   Must be valid Indian numbers (10 digits)
   Stored as: +919876543210
   Example: 9876543210 → +919876543210

📅 DATE FORMAT
   Must be: YYYY-MM-DD
   Example: 2025-12-20 (Dec 20, 2025)

🕐 TIME FORMAT
   Must be: HH:MM (24-hour)
   Example: 19:00 (7:00 PM)

👥 PARTY SIZE
   Must be number 1-20
   Example: "4" or 4

💬 SPECIAL REQUESTS
   Free text, optional
   Max ~200 characters recommended
```

---

## 🆚 Before vs After

```
BEFORE (Problem):
❌ Reservations created but not showing
❌ No admin view or controls
❌ No notifications after booking

AFTER (Solution):
✅ Reservations display in admin panel
✅ Admin can accept/cancel with 1 click
✅ Automatic SMS notifications sent
✅ Full status tracking with timestamps
```

---

## 📞 Contact Support

**Issue: SMS not received?**
- Check phone number format
- Test with `/api/test-sms` endpoint
- Check Twilio credentials in `.env.local`

**Issue: Reservation not showing?**
- Refresh the page (F5)
- Check if filter is hiding it
- Create new reservation to test

**Issue: Button not working?**
- Check JWT token is valid
- Check browser console for errors
- Try logout and login again

---

## 🎓 Training Summary

```
CUSTOMER                    ADMIN
│                          │
├─ Book table             ├─ View reservations
│  (5 min)                │  (1 min)
│                         │
├─ Receive SMS            ├─ Click Accept/Cancel
│  (1 min)                │  (1 min)
│                         │
│                         ├─ Receive SMS alert
│                         │  (1 sec)
│                         │
└─ Show up at time   <────┴─ Prepare table
   or contact admin          at reserved time
   if cancelled

TOTAL TIME TO MANAGE: 2-3 minutes per reservation
```

---

## 🔐 Security Reminders

✅ Always use HTTPS in production
✅ Keep JWT tokens secure
✅ Don't share admin password
✅ Use ADMIN_PHONE from environment only
✅ Validate all phone numbers before SMS

---

## 📊 Statistics Available

```
IN FUTURE (can be added):
• Total reservations this month
• Acceptance rate
• Cancellation rate
• Busiest time slots
• Peak reservation days
• Revenue impact calculation
```

---

## 🚀 Quick Start

```bash
1. Admin logs in at /admin/login
2. Goes to /admin/orders
3. Clicks "🍽️ Table Reservations"
4. Reviews pending reservations
5. Clicks green/red button to manage
6. Done! Customer gets SMS immediately
```

**Total setup time: 2 minutes** ⚡

---

**Last Updated:** December 15, 2025
**Version:** 1.0
