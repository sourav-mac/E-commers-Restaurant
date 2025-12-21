# 🍽️ Reservation Cancellation - Code Reference & Snippets

## API Endpoint: Cancel Reservation

**File:** `pages/api/reservations/[reservation_id]/cancel.js`

### Request
```bash
POST /api/reservations/a1b2c3d4/cancel
Content-Type: application/json

{
  "phone": "9876543210",
  "reason": "date_conflict"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Reservation cancelled successfully",
  "reservation": {
    "id": "a1b2c3d4",
    "name": "John Doe",
    "phone": "+919876543210",
    "originalPhone": "9876543210",
    "date": "2025-12-27",
    "time": "19:00",
    "size": "4",
    "note": "Window seat",
    "status": "cancelled",
    "cancelledAt": "2025-12-20T15:30:00.000Z",
    "cancelReason": "date_conflict",
    "cancelledByCustomer": true,
    "createdAt": "2025-12-15T10:30:00.000Z",
    "updatedAt": "2025-12-20T15:30:00.000Z"
  }
}
```

### Error Response (400)
```json
{
  "error": "Cannot cancel reservation with status: cancelled",
  "currentStatus": "cancelled"
}
```

---

## Frontend: My Orders Integration

**File:** `pages/my-orders.js`

### Import Component
```javascript
import CancelReservationModal from '../components/CancelReservationModal'
```

### Add State
```javascript
const [cancelResModalOpen, setCancelResModalOpen] = useState(false)
const [selectedRestoCancel, setSelectedRestoCancel] = useState(null)
const [cancelResLoading, setCancelResLoading] = useState(false)
```

### Helper Function
```javascript
const canCancelReservation = (reservation) => {
  if (!reservation) return false
  const cancellableStatuses = ['pending', 'accepted']
  return cancellableStatuses.includes(reservation.status)
}
```

### Open Modal Handler
```javascript
const handleOpenCancelResModal = (reservation) => {
  setSelectedRestoCancel(reservation)
  setCancelResModalOpen(true)
}

const handleCloseCancelResModal = () => {
  setCancelResModalOpen(false)
  setSelectedRestoCancel(null)
}
```

### Cancel Confirmation Handler
```javascript
const handleConfirmCancelRes = async (reason) => {
  if (!selectedRestoCancel) return

  setCancelResLoading(true)
  showLoading('Cancelling reservation...')

  try {
    const res = await fetch(`/api/reservations/${selectedRestoCancel.id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phone,
        reason: reason
      })
    })

    const data = await res.json()

    if (res.ok) {
      // Update reservation in list
      setReservations(prev =>
        prev.map(r =>
          r.id === selectedRestoCancel.id
            ? { ...r, status: 'cancelled', cancelledAt: data.reservation.cancelledAt }
            : r
        )
      )

      handleCloseCancelResModal()
      alert('✅ Reservation cancelled successfully. Admin has been notified.')
    } else {
      alert('❌ ' + (data.error || 'Failed to cancel reservation'))
    }
  } catch (err) {
    console.error('Cancellation error:', err)
    alert('❌ Failed to cancel reservation. Please try again.')
  } finally {
    setCancelResLoading(false)
    hideLoading()
  }
}
```

### Show Cancel Button in JSX
```jsx
{/* Status Message */}
<div className="border-t border-[var(--petuk-orange)]/20 mt-4 pt-4">
  {reservation.status === 'pending' && (
    <p className="text-yellow-400 text-sm">⏳ Your reservation is pending...</p>
  )}
  {reservation.status === 'accepted' && (
    <p className="text-green-400 text-sm">✅ Your reservation has been confirmed...</p>
  )}
  {reservation.status === 'cancelled' && (
    <p className="text-red-400 text-sm">❌ This reservation has been cancelled.</p>
  )}

  {/* Cancel Button */}
  {canCancelReservation(reservation) && (
    <div className="mt-4">
      <button
        onClick={() => handleOpenCancelResModal(reservation)}
        className="px-4 py-2 rounded font-semibold transition bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
      >
        ✕ Cancel Reservation
      </button>
      <p className="text-xs text-gray-500 mt-2">
        You can cancel this reservation before the date
      </p>
    </div>
  )}
</div>
```

### Add Modal at End
```jsx
{/* Cancel Reservation Modal */}
<CancelReservationModal
  isOpen={cancelResModalOpen}
  reservation={selectedRestoCancel}
  onConfirm={handleConfirmCancelRes}
  onCancel={handleCloseCancelResModal}
  isLoading={cancelResLoading}
/>
```

---

## Modal Component

**File:** `components/CancelReservationModal.js`

### Props
```typescript
interface CancelReservationModalProps {
  isOpen: boolean              // Show/hide modal
  reservation: Reservation     // Reservation being cancelled
  onConfirm: (reason) => void  // Callback on confirm
  onCancel: () => void         // Callback on cancel/close
  isLoading: boolean           // Show loading state
}
```

### Reason Options
```javascript
const reasonOptions = [
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'date_conflict', label: 'Date/time conflict' },
  { value: 'other_plans', label: 'Made other plans' },
  { value: 'unavailable', label: 'No longer available' },
  { value: 'other', label: 'Other (please specify)' }
]
```

---

## Real-Time Updates

### Socket.IO Broadcast Function

**File:** `lib/socketServer.js`

```javascript
export function broadcastReservationCancelled(data) {
  const io = getIO()
  if (!io) {
    console.log('⚠️ Socket.IO not initialized yet')
    return
  }
  
  console.log('❌ [Socket.IO] Broadcasting reservation cancellation:', data.id)
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

### Using in API
```javascript
// Import function
import { broadcastReservationCancelled } from '../../../../lib/socketServer'

// In cancel endpoint
try {
  broadcastReservationCancelled({
    id: reservation.id,
    name: reservation.name,
    phone: reservation.phone,
    cancelReason: reason,
    cancelledAt: updatedReservation.cancelledAt,
    date: reservation.date,
    time: reservation.time,
    size: reservation.size,
    reservation: updatedReservation
  })
} catch (err) {
  console.error('❌ Socket.IO broadcast failed:', err)
}
```

### Listening on Frontend

**File:** `context/NotificationContext.js`

```javascript
// Listen for reservation cancellations
socket.on('reservationCancelled', (data) => {
  console.log('❌ [Socket.IO] Reservation cancelled:', data.id)
  // Broadcast cancellation notification to admin
  showNotification(data, 'reservationCancelled', 'socket')
})
```

---

## Admin Notifications

### SMS to Customer
```
✅ Petuk Reservation Cancelled
Reservation ID: a1b2c3d4
Your table reservation has been successfully cancelled.
Date: 2025-12-27
Time: 19:00
Party Size: 4 people
Thank you for using Petuk!
```

### SMS to Admin
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

---

## Database Structure

### Reservation Object (orders.json)
```json
{
  "id": "a1b2c3d4",
  "name": "John Doe",
  "phone": "+919876543210",
  "originalPhone": "9876543210",
  "date": "2025-12-27",
  "time": "19:00",
  "size": "4",
  "note": "Window seat",
  "status": "cancelled",
  "cancelledAt": "2025-12-20T15:30:00.000Z",
  "cancelReason": "date_conflict",
  "cancelledByCustomer": true,
  "createdAt": "2025-12-15T10:30:00.000Z",
  "updatedAt": "2025-12-20T15:30:00.000Z"
}
```

---

## Error Handling

### Invalid Status
```javascript
if (!cancellableStatuses.includes(reservation.status)) {
  return res.status(400).json({
    error: `Cannot cancel reservation with status: ${reservation.status}`,
    currentStatus: reservation.status
  })
}
```

### Phone Mismatch
```javascript
const normalizedPhone = phone.slice(-10)
const resPhone = reservation.phone.slice(-10)

if (normalizedPhone !== resPhone) {
  return res.status(403).json({
    error: 'Phone number does not match this reservation'
  })
}
```

### Reservation Not Found
```javascript
if (reservationIndex === -1) {
  return res.status(404).json({
    error: 'Reservation not found'
  })
}
```

---

## Testing Examples

### Test with cURL
```bash
# Cancel reservation
curl -X POST http://localhost:3000/api/reservations/a1b2c3d4/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "reason": "date_conflict"
  }'
```

### Test with JavaScript
```javascript
// In browser console
const response = await fetch('/api/reservations/a1b2c3d4/cancel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '9876543210',
    reason: 'date_conflict'
  })
})

const data = await response.json()
console.log(data)
```

---

## Validation Checklist

```javascript
// Validation logic from API
const validations = {
  reservationExists: reservationIndex !== -1,
  phoneMatches: normalizedPhone.slice(-10) === resPhone.slice(-10),
  statusCancellable: cancellableStatuses.includes(reservation.status),
  reasonProvided: reason && reason.trim(),
  notAlreadyCancelled: reservation.status !== 'cancelled'
}

// All must be true
const allValid = Object.values(validations).every(v => v === true)
```

---

## Configuration

### Environment Variables
```env
# SMS Notifications
ADMIN_PHONE=+919876543210
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1234567890
```

### Cancellable Statuses (Configurable)
```javascript
const CANCELLABLE_STATUSES = ['pending', 'accepted']
// Modify this array to change which statuses allow cancellation
```

---

## Performance Notes

- ✅ **Async SMS:** Notifications sent in background (don't block response)
- ✅ **Real-time Updates:** WebSocket for instant admin notification
- ✅ **Efficient Queries:** Single database read/write operation
- ✅ **Error Recovery:** Failed SMS doesn't fail cancellation

---

## Future Enhancements

```javascript
// Rescheduling support (future)
async function rescheduleReservation(reservation, newDate, newTime) {
  // Allow customer to reschedule instead of cancelling
  // Send SMS with new confirmation
}

// Waitlist support (future)
function addToWaitlist(reservationData) {
  // Add cancelled slot to waitlist
  // Notify waitlisted customers
}

// Analytics (future)
function trackCancellationPattern(reason) {
  // Track why reservations are cancelled
  // Identify trends and improvements
}
```

---

**Last Updated:** December 21, 2025  
**Version:** 1.0
