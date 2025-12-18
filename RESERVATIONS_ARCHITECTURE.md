# Reservations System Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PETUK RESERVATIONS SYSTEM                    │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                          CUSTOMER SIDE                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [/reserve PAGE]  ──────→  Fill Form  ──────→  [POST /api/reserve] │
│  • Name                                                              │
│  • Phone                                                             │
│  • Date                                                              │
│  • Time                                                              │
│  • Party Size                                                        │
│  • Notes                                                             │
│                                                                      │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                        [DATABASE]
                     data/orders.json
                   reservations: [...]
                             │
        ┌────────────────────┴─────────────────────┐
        │                                          │
        │ Send SMS to Customer              Send SMS to Admin
        │ (Booking Confirmation)            (Alert about new)
        │                                          │
        └────────────────────┬─────────────────────┘
                             │
┌────────────────────────────┴─────────────────────────────────────────┐
│                          ADMIN SIDE                                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [/admin/orders PAGE]  ──→  Table Reservations Tab                │
│                                    │                                │
│        ┌───────────────────────────┴────────────────────────┐      │
│        │                                                    │      │
│  [Search & Filter]                              [Reservation Cards]
│  • By Name                                      • Show Details      │
│  • By Phone                                     • Status Badge      │
│  • By ID                                        • Action Buttons    │
│  • By Status                                                       │
│        │                                                    │      │
│        └──────────────────┬─────────────────────────────────┘      │
│                           │                                        │
│                  Click Button to Manage:                           │
│                  • Accept (Green)                                  │
│                  • Cancel (Red)                                    │
│                           │                                        │
└───────────────────────────┼────────────────────────────────────────┘
                            │
                  [PATCH /api/admin/reservations/[id]]
                            │
                   [UPDATE DATABASE]
                  Set new status & timestamp
                            │
        ┌───────────────────┴────────────────────┐
        │                                        │
        │ Send SMS to Customer             Update Admin UI
        │ • If Accepted: Confirmation       Status Changed
        │ • If Cancelled: Cancellation      Button Disabled
        │                                        │
        └───────────────────┬────────────────────┘
                            │
                        📱 CUSTOMER
                      Receives SMS
                   Makes Reservation
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      COMPLETE DATA FLOW                             │
└─────────────────────────────────────────────────────────────────────┘

STEP 1: CUSTOMER BOOKS
────────────────────
Customer Form Input
├─ name: "John Doe"
├─ phone: "9876543210"
├─ date: "2025-12-20"
├─ time: "19:00"
├─ size: "4"
└─ note: "Window seat"
        │
        ├─→ POST /api/reserve
        │
        ├─→ Validate Input
        │   ├─ Check all fields exist
        │   ├─ Format phone: "9876543210" → "+919876543210"
        │   └─ Create UUID: "a1b2c3d4"
        │
        ├─→ Create Reservation Object:
        │   {
        │     id: "a1b2c3d4",
        │     name: "John Doe",
        │     phone: "+919876543210",
        │     originalPhone: "9876543210",
        │     date: "2025-12-20",
        │     time: "19:00",
        │     size: "4",
        │     note: "Window seat",
        │     status: "pending",
        │     createdAt: "2025-12-15T10:30:00Z"
        │   }
        │
        ├─→ Write to data/orders.json
        │   reservations: [
        │     { existing... },
        │     { new reservation } ← Added here
        │   ]
        │
        ├─→ Send SMS to Customer
        │   Message: "🎯 Petuk Reservation Confirmed!..."
        │   To: "+919876543210"
        │   Status: ✅ Sent
        │
        └─→ Send SMS to Admin
            Message: "🔔 NEW RESERVATION REQUEST!..."
            To: "+91[ADMIN_PHONE]"
            Status: ✅ Sent


STEP 2: ADMIN VIEWS
──────────────────
Admin Login
├─ Go to /admin/orders
├─ Click "🍽️ Table Reservations" tab
│
└─→ GET /api/admin/orders
    ├─ Verify JWT Token: ✅ Valid
    │
    ├─→ Read data/orders.json
    │   Extract: reservations array
    │
    ├─→ Return JSON:
    │   {
    │     success: true,
    │     orders: [...],
    │     reservations: [
    │       {
    │         id: "a1b2c3d4",
    │         name: "John Doe",
    │         phone: "+919876543210",
    │         date: "2025-12-20",
    │         time: "19:00",
    │         size: "4",
    │         note: "Window seat",
    │         status: "pending",
    │         createdAt: "2025-12-15T10:30:00Z"
    │       }
    │     ]
    │   }
    │
    └─→ Display Reservation Card
        ├─ Show all details
        ├─ Status: 🟡 Pending
        └─ Buttons: [✓ Accept] [✕ Cancel]


STEP 3A: ADMIN ACCEPTS
──────────────────────
Admin Clicks: "✓ Accept Reservation"
├─→ PATCH /api/admin/reservations/a1b2c3d4
    ├─ Verify JWT Token: ✅ Valid
    ├─ Request Body: { status: "accepted" }
    │
    ├─→ Read data/orders.json
    │   Find: reservations[index].id === "a1b2c3d4"
    │
    ├─→ Update Reservation:
    │   {
    │     ...existing data...,
    │     status: "accepted",      ← Changed
    │     updatedAt: "2025-12-15T10:35:00Z"  ← Set
    │   }
    │
    ├─→ Write back to data/orders.json
    │
    ├─→ Send SMS to Customer
    │   Message:
    │   "✅ Your Petuk reservation has been CONFIRMED!
    │    Reservation ID: a1b2c3d4
    │    Date: 2025-12-20
    │    Time: 19:00
    │    Party Size: 4
    │    We look forward to serving you!"
    │   To: "+919876543210"
    │   Status: ✅ Sent
    │
    └─→ Return Response:
        {
          success: true,
          message: "Reservation accepted",
          reservation: { updated object },
          smsNotified: true
        }
        │
        └─→ Admin UI Updates:
            ├─ Status Badge: 🟢 Accepted
            ├─ Hide: Accept Button
            └─ Show: Cancel Button (still available)


STEP 3B: ADMIN CANCELS (Alternative)
─────────────────────────────────────
Admin Clicks: "✕ Cancel Reservation"
├─→ PATCH /api/admin/reservations/a1b2c3d4
    ├─ Verify JWT Token: ✅ Valid
    ├─ Request Body: { status: "cancelled" }
    │
    ├─→ Read data/orders.json
    │   Find: reservations[index].id === "a1b2c3d4"
    │
    ├─→ Update Reservation:
    │   {
    │     ...existing data...,
    │     status: "cancelled",     ← Changed
    │     updatedAt: "2025-12-15T10:40:00Z"  ← Set
    │   }
    │
    ├─→ Write back to data/orders.json
    │
    ├─→ Send SMS to Customer
    │   Message:
    │   "❌ Your Petuk reservation (ID: a1b2c3d4)
    │    for 2025-12-20 at 19:00 has been CANCELLED.
    │    Please contact us for more information.
    │    Phone: [ADMIN_PHONE]"
    │   To: "+919876543210"
    │   Status: ✅ Sent
    │
    └─→ Return Response:
        {
          success: true,
          message: "Reservation cancelled",
          reservation: { updated object },
          smsNotified: true
        }
        │
        └─→ Admin UI Updates:
            ├─ Status Badge: 🔴 Cancelled
            ├─ Hide: All Action Buttons
            └─ Show: "Reservation Cancelled" text


STEP 4: CUSTOMER RECEIVES NOTIFICATION
──────────────────────────────────────
Customer's Phone
├─ SMS Arrives: +919876543210
├─ Message Type:
│  • If Accepted: ✅ Confirmation with details
│  • If Cancelled: ❌ Cancellation with contact info
│
└─ Customer Can Now:
   ├─ Plan for dinner (if accepted)
   ├─ Contact admin for alternatives (if cancelled)
   └─ Confirm or cancel reservation
```

---

## Request/Response Flow

### 1. Create Reservation Request

```
═══════════════════════════════════════════════════════════
REQUEST
═══════════════════════════════════════════════════════════

POST /api/reserve HTTP/1.1
Host: petuk.example.com
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "9876543210",
  "date": "2025-12-20",
  "time": "19:00",
  "size": "4",
  "note": "Window seat"
}

═══════════════════════════════════════════════════════════
RESPONSE
═══════════════════════════════════════════════════════════

HTTP/1.1 200 OK
Content-Type: application/json

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
    "note": "Window seat",
    "status": "pending",
    "createdAt": "2025-12-15T10:30:00.000Z"
  }
}
```

---

### 2. Fetch Reservations Request

```
═══════════════════════════════════════════════════════════
REQUEST
═══════════════════════════════════════════════════════════

GET /api/admin/orders HTTP/1.1
Host: petuk.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

═══════════════════════════════════════════════════════════
RESPONSE
═══════════════════════════════════════════════════════════

HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "orders": [ ... ],
  "reservations": [
    {
      "id": "a1b2c3d4",
      "name": "John Doe",
      "phone": "+919876543210",
      "date": "2025-12-20",
      "time": "19:00",
      "size": "4",
      "note": "Window seat",
      "status": "pending",
      "createdAt": "2025-12-15T10:30:00.000Z"
    },
    {
      "id": "x1y2z3w4",
      "name": "Jane Smith",
      "phone": "+919123456789",
      "date": "2025-12-20",
      "time": "20:00",
      "size": "2",
      "note": "",
      "status": "accepted",
      "createdAt": "2025-12-15T09:00:00.000Z",
      "updatedAt": "2025-12-15T09:05:00.000Z"
    }
  ]
}
```

---

### 3. Update Reservation Request

```
═══════════════════════════════════════════════════════════
REQUEST (ACCEPT)
═══════════════════════════════════════════════════════════

PATCH /api/admin/reservations/a1b2c3d4 HTTP/1.1
Host: petuk.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "accepted"
}

═══════════════════════════════════════════════════════════
REQUEST (CANCEL)
═══════════════════════════════════════════════════════════

PATCH /api/admin/reservations/a1b2c3d4 HTTP/1.1
Host: petuk.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "cancelled"
}

═══════════════════════════════════════════════════════════
RESPONSE
═══════════════════════════════════════════════════════════

HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Reservation accepted",  // or "cancelled"
  "reservation": {
    "id": "a1b2c3d4",
    "name": "John Doe",
    "phone": "+919876543210",
    "date": "2025-12-20",
    "time": "19:00",
    "size": "4",
    "note": "Window seat",
    "status": "accepted",  // or "cancelled"
    "createdAt": "2025-12-15T10:30:00.000Z",
    "updatedAt": "2025-12-15T10:35:00.000Z"
  },
  "smsNotified": true
}
```

---

## Database Structure

```
data/orders.json
{
  "orders": [
    {
      "order_id": "PETUK-20251213-xxx",
      "customer": {...},
      "items": [...],
      ...
    },
    ... more orders ...
  ],
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
      "status": "pending",        // Can be: pending, accepted, cancelled
      "createdAt": "2025-12-15T10:30:00.000Z",
      "updatedAt": null           // Set when status changes
    },
    {
      "id": "x1y2z3w4",
      "name": "Jane Smith",
      "phone": "+919123456789",
      "originalPhone": "9123456789",
      "date": "2025-12-20",
      "time": "20:00",
      "size": "2",
      "note": "",
      "status": "accepted",
      "createdAt": "2025-12-15T09:00:00.000Z",
      "updatedAt": "2025-12-15T09:05:00.000Z"
    },
    {
      "id": "p1q2r3s4",
      "name": "Mike Johnson",
      "phone": "+919999999999",
      "originalPhone": "9999999999",
      "date": "2025-12-21",
      "time": "18:00",
      "size": "6",
      "note": "Birthday party",
      "status": "cancelled",
      "createdAt": "2025-12-14T14:00:00.000Z",
      "updatedAt": "2025-12-14T14:30:00.000Z"
    }
  ]
}
```

---

## Component Interaction

```
┌────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  pages/admin/orders.js                                    │
│  ├─ State Management                                       │
│  │  ├─ reservations: []                                   │
│  │  ├─ statusFilter: "all"                               │
│  │  ├─ searchTerm: ""                                    │
│  │  └─ filteredReservations: []                          │
│  │                                                         │
│  ├─ Functions                                              │
│  │  ├─ fetchData() → GET /api/admin/orders               │
│  │  ├─ updateReservationStatus()                          │
│  │  │  └─ PATCH /api/admin/reservations/{id}             │
│  │  ├─ filterReservations()                               │
│  │  └─ handleSearch()                                     │
│  │                                                         │
│  └─ UI Components                                          │
│     ├─ Search Bar                                          │
│     ├─ Status Filter Dropdown                             │
│     ├─ Reservation Cards                                  │
│     │  ├─ Card Header (ID, Name, Phone)                  │
│     │  ├─ Details (Date, Time, Size, Notes)             │
│     │  ├─ Status Badge (Color-coded)                     │
│     │  └─ Action Buttons                                  │
│     │     ├─ Accept (Green)                               │
│     │     └─ Cancel (Red)                                 │
│     └─ Loading States                                     │
│                                                            │
└────────────────┬─────────────────────────────────────────┘
                 │ HTTP Requests
                 │ JSON Format
                 ↓
┌────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  API Endpoints                                             │
│  ├─ POST /api/reserve                                     │
│  │  ├─ Validate Input                                     │
│  │  ├─ Format Phone                                       │
│  │  ├─ Create Reservation                                 │
│  │  ├─ Save to Database                                   │
│  │  └─ Send SMS                                           │
│  │                                                         │
│  ├─ GET /api/admin/orders                                 │
│  │  ├─ Verify JWT                                         │
│  │  ├─ Read Database                                      │
│  │  └─ Return JSON                                        │
│  │                                                         │
│  └─ PATCH /api/admin/reservations/{id}                   │
│     ├─ Verify JWT                                         │
│     ├─ Validate Status                                    │
│     ├─ Update Database                                    │
│     ├─ Send SMS Notification                              │
│     └─ Return Updated Data                                │
│                                                            │
└────────────────┬─────────────────────────────────────────┘
                 │ File I/O
                 ↓
┌────────────────────────────────────────────────────────────┐
│                    DATABASE (File)                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  data/orders.json                                          │
│  ├─ orders: [ ... ]        (existing orders)              │
│  └─ reservations: [ ... ]  (table reservations)            │
│                                                            │
└────────────────┬─────────────────────────────────────────┘
                 │ Phone Numbers
                 ↓
┌────────────────────────────────────────────────────────────┐
│                    SMS SERVICE (Twilio)                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ├─ Send Booking SMS                                      │
│  ├─ Send Acceptance SMS                                   │
│  └─ Send Cancellation SMS                                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
                         ↓
                    📱 CUSTOMER PHONE
```

---

## Status Transition Diagram

```
              ┌─────────┐
              │ CREATE  │
              │ FORM    │
              └────┬────┘
                   │
        POST /api/reserve
                   │
                   ↓
            ┌──────────────┐
            │   PENDING    │  ← Initial Status
            │  (Yellow)    │
            └──────┬───────┘
                   │
         ┌─────────┴─────────┐
         │                   │
      ACCEPT              CANCEL
         │                   │
         ↓                   ↓
    ┌─────────┐        ┌────────────┐
    │ ACCEPTED│        │ CANCELLED  │
    │ (Green) │        │  (Red)     │
    └────┬────┘        └────┬───────┘
         │                  │
         └──────┬───────────┘
                │
         Can CANCEL from
         ACCEPTED state
              │
              ↓
        ┌──────────────┐
        │   CANCELLED  │
        │    (Red)     │  ← Final State
        └──────────────┘
```

---

## Error Handling Flow

```
┌─────────────────────────────────┐
│  API Request Received           │
└────────────┬────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ↓                 ↓
VALIDATION         AUTHENTICATION
    │                 │
Has Required    JWT Token Valid?
Fields?              │
    │        ┌────────┴────────┐
    │        │                 │
Invalid     ✅ Valid        ❌ Invalid
    │        │                 │
    ↓        ↓                 ↓
400 Error  Continue      401 Error
    │        │
    └────────┴─────────────────┐
                               │
                    ┌──────────┴──────────┐
                    │                     │
              Database OK           Database Error
                    │                     │
                    ↓                     ↓
              ✅ 200 Success          ❌ 500 Error
              Return Data          Return Error
              + SMS Notification    + Error Message
```

---

## Summary of All Interactions

| Step | Actor | Action | Endpoint | Result |
|------|-------|--------|----------|--------|
| 1 | Customer | Fill form & submit | POST /api/reserve | Reservation saved + SMS sent |
| 2 | Twilio | Deliver SMS | (Background) | Customer notified |
| 3 | Admin | Log in | /admin/login | Receive JWT token |
| 4 | Admin | Navigate to orders | /admin/orders | Load page |
| 5 | Admin | Click reservations tab | (Frontend) | Load reservations |
| 6 | App | Fetch reservations | GET /api/admin/orders | Display all reservations |
| 7 | Admin | Click Accept/Cancel | (Frontend click) | Prepare request |
| 8 | App | Send update | PATCH /api/admin/reservations/{id} | Update status |
| 9 | Twilio | Send SMS | (Background) | Customer notified |
| 10 | Customer | Receive SMS | (Mobile) | Know about decision |

---

This completes the comprehensive system architecture and data flow documentation!
