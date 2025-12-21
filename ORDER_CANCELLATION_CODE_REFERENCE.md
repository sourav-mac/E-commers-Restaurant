# 🚫 Order Cancellation - Code Reference & Snippets

## API Endpoint: Cancel Order

**File:** `pages/api/orders/[order_id]/cancel.js`

### Request
```bash
POST /api/orders/PETUK-20251220-abc123/cancel
Content-Type: application/json

{
  "phone": "9876543210",
  "reason": "changed_mind"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": {
    "order_id": "PETUK-20251220-abc123",
    "customer": {
      "name": "John Doe",
      "phone": "9876543210"
    },
    "status": "cancelled",
    "cancelledAt": "2025-12-20T15:30:00.000Z",
    "cancelReason": "changed_mind",
    "cancelledByCustomer": true,
    "total": 450,
    "payment_method": "razorpay"
  }
}
```

### Error Response (400)
```json
{
  "error": "Cannot cancel order with status: preparing",
  "currentStatus": "preparing"
}
```

---

## Frontend: My Orders Integration

**File:** `pages/my-orders.js`

### Import Component
```javascript
import CancelOrderModal from '../components/CancelOrderModal'
```

### Add State
```javascript
const [cancelModalOpen, setCancelModalOpen] = useState(false)
const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null)
const [cancelLoading, setCancelLoading] = useState(false)
```

### Helper Function
```javascript
const canCancelOrder = (order) => {
  if (!order) return false
  const cancellableStatuses = ['placed', 'confirmed', 'ready']
  return cancellableStatuses.includes(order.status)
}
```

### Open Modal Handler
```javascript
const handleOpenCancelModal = (order) => {
  setSelectedOrderToCancel(order)
  setCancelModalOpen(true)
}

const handleCloseCancelModal = () => {
  setCancelModalOpen(false)
  setSelectedOrderToCancel(null)
}
```

### Cancel Confirmation Handler
```javascript
const handleConfirmCancel = async (reason) => {
  if (!selectedOrderToCancel) return

  setCancelLoading(true)
  showLoading('Cancelling order...')

  try {
    const res = await fetch(`/api/orders/${selectedOrderToCancel.order_id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phone,
        reason: reason
      })
    })

    const data = await res.json()

    if (res.ok) {
      // Update order in list
      setOrders(prev =>
        prev.map(o =>
          o.order_id === selectedOrderToCancel.order_id
            ? { ...o, status: 'cancelled', cancelledAt: data.order.cancelledAt }
            : o
        )
      )

      handleCloseCancelModal()
      alert('✅ Order cancelled successfully. Admin has been notified.')
    } else {
      alert('❌ ' + (data.error || 'Failed to cancel order'))
    }
  } catch (err) {
    console.error('Cancellation error:', err)
    alert('❌ Failed to cancel order. Please try again.')
  } finally {
    setCancelLoading(false)
    hideLoading()
  }
}
```

### Show Cancel Button in JSX
```jsx
{/* Status Message */}
<div className="border-t border-[var(--petuk-orange)]/20 mt-4 pt-4">
  {order.status === 'placed' && (
    <p className="text-blue-400 text-sm">⏳ Your order is placed...</p>
  )}
  {/* ... other status messages ... */}
  
  {/* Cancel Button */}
  {canCancelOrder(order) && (
    <div className="mt-4">
      <button
        onClick={() => handleOpenCancelModal(order)}
        className="px-4 py-2 rounded font-semibold transition bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
      >
        ✕ Cancel Order
      </button>
      <p className="text-xs text-gray-500 mt-2">
        You can cancel this order before it's prepared
      </p>
    </div>
  )}
</div>
```

### Add Modal at End
```jsx
{/* Cancel Order Modal */}
<CancelOrderModal
  isOpen={cancelModalOpen}
  order={selectedOrderToCancel}
  onConfirm={handleConfirmCancel}
  onCancel={handleCloseCancelModal}
  isLoading={cancelLoading}
/>
```

---

## Modal Component

**File:** `components/CancelOrderModal.js`

### Props
```typescript
interface CancelOrderModalProps {
  isOpen: boolean              // Show/hide modal
  order: Order | null          // Order being cancelled
  onConfirm: (reason) => void  // Callback on confirm
  onCancel: () => void         // Callback on cancel/close
  isLoading: boolean           // Show loading state
}
```

### Reason Options
```javascript
const reasonOptions = [
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'delivery_time', label: 'Taking too long' },
  { value: 'other_place', label: 'Ordering from elsewhere' },
  { value: 'other', label: 'Other (please specify)' }
]
```

---

## Real-Time Updates

### Socket.IO Broadcast Function

**File:** `lib/socketServer.js`

```javascript
export function broadcastOrderCancelled(data) {
  const io = getIO()
  if (!io) {
    console.log('⚠️ Socket.IO not initialized yet')
    return
  }
  
  console.log('❌ [Socket.IO] Broadcasting order cancellation:', data.order_id)
  io.to('admin').emit('orderCancelled', {
    order_id: data.order_id,
    customer_name: data.customer?.name,
    customer_phone: data.customer?.phone,
    status: 'cancelled',
    cancelReason: data.cancelReason,
    cancelledAt: data.cancelledAt,
    total: data.order?.total || 0,
    payment_method: data.order?.payment_method
  })
}
```

### Using in API
```javascript
// Import function
import { broadcastOrderCancelled } from '../../../../lib/socketServer'

// In cancel endpoint
try {
  broadcastOrderCancelled({
    order_id: order.order_id,
    customer: order.customer,
    cancelReason: reason,
    cancelledAt: updatedOrder.cancelledAt,
    order: updatedOrder
  })
} catch (err) {
  console.error('❌ Socket.IO broadcast failed:', err)
}
```

### Listening on Frontend

**File:** `context/NotificationContext.js`

```javascript
// Listen for order cancellations
socket.on('orderCancelled', (data) => {
  console.log('❌ [Socket.IO] Order cancelled:', data.order_id)
  // Broadcast cancellation notification to admin
  showNotification(data, 'orderCancelled', 'socket')
})
```

---

## Admin Notifications

### SMS to Customer
```
✅ Petuk Order Cancelled
Order ID: PETUK-20251220-abc123
Your order has been successfully cancelled.
Amount: ₹450
Refund will be processed in 3-5 business days.
Thank you for using Petuk!
```

### SMS to Admin
```
🚨 ORDER CANCELLED BY CUSTOMER
Order ID: PETUK-20251220-abc123
Customer: John Doe
Phone: 9876543210
Amount: ₹450
Reason: Changed my mind
Payment: Online
Status Before: placed
Cancelled At: 20/12/2025, 3:30 PM
```

---

## Database Updates

### Data Structure (orders.json)
```json
{
  "order_id": "PETUK-20251220-abc123",
  "customer": {
    "name": "John Doe",
    "phone": "9876543210"
  },
  "items": [...],
  "total": 450,
  "status": "cancelled",
  "cancelledAt": "2025-12-20T15:30:00.000Z",
  "cancelReason": "changed_mind",
  "cancelledByCustomer": true,
  "createdAt": "2025-12-20T15:00:00.000Z",
  "payment_method": "razorpay"
}
```

---

## Admin Dashboard Integration

### Cancelled Orders Count
```javascript
const statusCounts = {
  placed: activeOrders.filter(o => o.status === 'placed').length,
  confirmed: activeOrders.filter(o => o.status === 'confirmed').length,
  preparing: activeOrders.filter(o => o.status === 'preparing').length,
  ready: activeOrders.filter(o => o.status === 'ready').length,
  delivered: activeOrders.filter(o => o.status === 'delivered').length,
  cancelled: orders.filter(o => o.status === 'cancelled').length  // All including cancelled
}
```

### Status Badge
```jsx
<span className={`px-2 py-1 rounded text-xs font-semibold ${
  order.status === 'cancelled' ? 'bg-red-900/30 text-red-400' : '...'
}`}>
  {order.status}
</span>
```

### Filter by Status
```javascript
orders.filter(order => !selectedStatus || order.status === selectedStatus)
```

---

## Error Handling

### Invalid Status
```javascript
if (!cancellableStatuses.includes(order.status)) {
  return res.status(400).json({
    error: `Cannot cancel order with status: ${order.status}`,
    currentStatus: order.status
  })
}
```

### Phone Mismatch
```javascript
const normalizedPhone = phone.slice(-10)
const orderPhone = order.customer.phone.slice(-10)

if (normalizedPhone !== orderPhone) {
  return res.status(403).json({
    error: 'Phone number does not match this order'
  })
}
```

### Order Not Found
```javascript
if (orderIndex === -1) {
  return res.status(404).json({
    error: 'Order not found'
  })
}
```

---

## Testing Examples

### Test with cURL
```bash
# Cancel order
curl -X POST http://localhost:3000/api/orders/PETUK-20251220-abc123/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "reason": "changed_mind"
  }'
```

### Test with JavaScript
```javascript
// In browser console
const response = await fetch('/api/orders/PETUK-20251220-abc123/cancel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '9876543210',
    reason: 'changed_mind'
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
  orderExists: orderIndex !== -1,
  phoneMatches: normalizedPhone.slice(-10) === orderPhone.slice(-10),
  statusCancellable: cancellableStatuses.includes(order.status),
  reasonProvided: reason && reason.trim(),
  notAlreadyCancelled: order.status !== 'cancelled'
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
const CANCELLABLE_STATUSES = ['placed', 'confirmed', 'ready']
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
// Auto-refund implementation (future)
async function processRefund(order) {
  if (order.payment_method === 'razorpay') {
    const refund = await razorpay.payments.refund(order.razorpay_payment_id, {
      amount: order.total * 100,
      receipt: `REFUND-${order.order_id}`
    })
    return refund
  }
}

// Time-window validation (future)
function canCancelWithinTimeWindow(order, minMinutes = 5) {
  const createdAt = new Date(order.createdAt)
  const now = new Date()
  const minutesPassed = (now - createdAt) / (1000 * 60)
  return minutesPassed <= minMinutes
}

// Track cancellation patterns (future)
function trackCancellationReason(reason) {
  // Analytics to understand why customers cancel
  // Help improve products/service
}
```

---

**Last Updated:** December 21, 2025  
**Version:** 1.0
