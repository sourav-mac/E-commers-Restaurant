# 🍽️ Reservation Cancellation Feature - Complete Documentation

## Overview

This feature allows customers to cancel their table reservations. The system ensures:
- ✅ Reservations can only be cancelled in specific statuses
- ✅ Admin is notified instantly
- ✅ Customer receives SMS confirmation
- ✅ Real-time dashboard updates
- ✅ Secure verification (phone number validation)

---

## 📋 Feature Specifications

### Cancellable Reservation Statuses

Users can only cancel reservations in these statuses:
- `pending` - Reservation awaiting admin confirmation
- `accepted` - Admin confirmed the reservation

### Non-Cancellable Statuses

Reservations CANNOT be cancelled in these statuses:
- `cancelled` - Already cancelled

---

## 🏗️ Architecture

### Files Created

#### 1. **Component: Cancel Reservation Modal**
**File:** `components/CancelReservationModal.js`

Modal dialog for reservation cancellation.

**Features:**
- Reason selection (dropdown with predefined reasons)
- Custom reason textarea for "Other" option
- Reservation details display
- Confirmation buttons
- Loading state

**Usage:**
```javascript
<CancelReservationModal
  isOpen={cancelResModalOpen}
  reservation={selectedReservation}
  onConfirm={handleConfirmCancelRes}
  onCancel={handleCloseCancelResModal}
  isLoading={cancelResLoading}
/>
```

---

#### 2. **API Endpoint: Cancel Reservation**
**File:** `pages/api/reservations/[reservation_id]/cancel.js`

**HTTP Method:** `POST`

**Request:**
```javascript
POST /api/reservations/RES_ID/cancel
Content-Type: application/json

{
  "phone": "9876543210",
  "reason": "date_conflict"
}
```

**Response on Success (200):**
```json
{
  "success": true,
  "message": "Reservation cancelled successfully",
  "reservation": {
    "id": "a1b2c3d4",
    "status": "cancelled",
    "cancelledAt": "2025-12-20T15:30:00.000Z",
    "cancelReason": "date_conflict",
    ...
  }
}
```

**Validations:**
- ✅ Reservation ID exists
- ✅ Phone number matches reservation customer phone
- ✅ Reservation status is cancellable
- ✅ Reason is provided

**Actions on Success:**
1. Update reservation status to `cancelled`
2. Set `cancelledAt` timestamp
3. Save `cancelReason`
4. Send SMS to customer
5. Send SMS to admin
6. Broadcast via SSE & Socket.IO

---

#### 3. **Socket.IO Broadcast Function**
**File:** `lib/socketServer.js`

**New Function:** `broadcastReservationCancelled(data)`

```javascript
export function broadcastReservationCancelled(data) {
  const io = getIO()
  if (!io) return
  
  io.to('admin').emit('reservationCancelled', {
    id: data.id,
    name: data.name,
    phone: data.phone,
    status: 'cancelled',
    cancelReason: data.cancelReason,
    cancelledAt: data.cancelledAt,
    date: data.date,
    time: data.time,
    size: data.size
  })
}
```

---

#### 4. **Notification Context Update**
**File:** `context/NotificationContext.js`

**Added Socket.IO Event Listener:**
```javascript
socket.on('reservationCancelled', (data) => {
  console.log('❌ [Socket.IO] Reservation cancelled:', data.id)
  showNotification(data, 'reservationCancelled', 'socket')
})
```

---

### Files Modified

#### 1. **My Orders Page**
**File:** `pages/my-orders.js`

**Changes:**
- Added `CancelReservationModal` import
- Added state management:
  - `cancelResModalOpen` - Modal visibility
  - `selectedRestoCancel` - Reservation being cancelled
  - `cancelResLoading` - API request loading state
- Added `handleOpenCancelResModal(reservation)` function
- Added `handleCloseCancelResModal()` function
- Added `handleConfirmCancelRes(reason)` function
- Added `canCancelReservation(reservation)` helper
- Added cancel button below reservation status message
- Added modal component at end of JSX

---

## 📱 User Flow

### Step 1: User Views Reservations
```
User opens "My Orders" page
↓
Enters phone number
↓
Sees list of reservations with status badges
```

### Step 2: User Clicks Cancel
```
User sees reservation in "pending" or "accepted" status
↓
Clicks "✕ Cancel Reservation" button
↓
Modal opens with confirmation dialog
```

### Step 3: User Confirms Cancellation
```
User selects cancellation reason
↓
(Optional) Enters custom reason if "Other"
↓
Clicks "Yes, Cancel Reservation" button
↓
API request sent to backend
```

### Step 4: Backend Processes
```
Backend validates:
  - Reservation exists
  - Phone matches
  - Status is cancellable
↓
Updates reservation status to "cancelled"
↓
Sends SMS notifications to customer & admin
↓
Broadcasts real-time updates via WebSocket
↓
Returns success response
```

### Step 5: User Sees Updated Status
```
Reservation status changes to "Cancelled" (red)
↓
Cancel button disappears
↓
Confirmation message shows
↓
Success toast notification displayed
```

---

## 🔔 Notifications

### Customer SMS

Sent when reservation is cancelled by customer:
```
✅ Petuk Reservation Cancelled
Reservation ID: a1b2c3d4
Your table reservation has been successfully cancelled.
Date: 2025-12-27
Time: 19:00
Party Size: 4 people
Thank you for using Petuk!
```

### Admin SMS

Sent when customer cancels a reservation:
```
🚨 RESERVATION CANCELLED BY CUSTOMER
Reservation ID: a1b2c3d4
Customer: John Doe
Phone: 9876543210
Date: 2025-12-27
Time: 19:00
Party Size: 4 people
Reason: Date/time conflict
Cancelled At: 20/12/2025, 3:30 PM
```

### Admin Real-Time Notification

Via Socket.IO:
```javascript
{
  id: "a1b2c3d4",
  name: "John Doe",
  phone: "9876543210",
  status: "cancelled",
  cancelReason: "date_conflict",
  cancelledAt: "2025-12-20T15:30:00.000Z",
  date: "2025-12-27",
  time: "19:00",
  size: "4"
}
```

---

## 🛡️ Security Features

### Phone Number Verification
```javascript
const normalizedPhone = phone.slice(-10)
const resPhone = reservation.phone.slice(-10)
if (normalizedPhone !== resPhone) {
  return error // Unauthorized
}
```

### Status Validation
```javascript
const cancellableStatuses = ['pending', 'accepted']
if (!cancellableStatuses.includes(reservation.status)) {
  return error // Cannot cancel
}
```

---

## 🧪 Testing Guide

### Manual Test

1. **Create a reservation:**
   ```bash
   # Visit /reserve page
   # Fill in details
   # Submit reservation
   # Phone: 9876543210
   ```

2. **View reservation in My Orders:**
   ```bash
   # Visit /my-orders
   # Enter phone: 9876543210
   # Click "Search"
   # See reservation in "pending" status
   ```

3. **Cancel the reservation:**
   ```bash
   # Click "✕ Cancel Reservation" button
   # Modal opens with reason selection
   # Select reason (e.g., "Date/time conflict")
   # Click "Yes, Cancel Reservation"
   # Wait for loading...
   ```

4. **Verify cancellation:**
   - ✅ Reservation status changes to "Cancelled" (red)
   - ✅ Cancel button disappears
   - ✅ Success toast shown
   - ✅ Customer SMS sent
   - ✅ Admin SMS sent

5. **Check admin dashboard:**
   ```bash
   # Open /admin/orders in another window
   # Click "Reservations" tab
   # See cancelled reservation
   ```

---

## 📊 Admin Dashboard Integration

**Cancelled Reservations:**
- Shows count in status summary
- Red status badge with "cancelled" label
- Cannot be edited/updated
- Disabled action buttons

---

## 🔧 Configuration

### Environment Variables
```env
# SMS notifications (optional)
ADMIN_PHONE=+919876543210
TWILIO_ACCOUNT_SID=xxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_FROM_NUMBER=+1234567890
```

---

## 📈 Future Enhancements

1. **Auto-Confirmation**
   - Send confirmation SMS immediately
   - Queue email notification

2. **Rescheduling**
   - Allow customers to reschedule instead of cancel

3. **Waitlist**
   - Add cancelled slots to waitlist

4. **Analytics**
   - Track cancellation patterns
   - Identify peak cancellation times

---

## ✅ Status: PRODUCTION READY

**All features implemented and tested.**

---

**Last Updated:** December 21, 2025  
**Version:** 1.0
