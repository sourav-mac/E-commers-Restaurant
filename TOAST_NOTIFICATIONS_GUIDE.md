# 🔔 Real-Time Toast Notifications System

Complete implementation guide for toast notifications in the Admin Dashboard.

## ✨ Features

✅ **Real-time notifications** - Instant toast when new orders/reservations arrive
✅ **Beautiful UI** - Gradient backgrounds, glowing effects, smooth animations
✅ **Click to view** - Click toast to open order/reservation details
✅ **Notification queue** - Multiple toasts stack without overlapping
✅ **Auto-dismiss** - Toasts auto-hide after 5 seconds
✅ **Mobile responsive** - Works on all screen sizes
✅ **Sound notification** - Audio alert (notification.wav)
✅ **Smooth animations** - Slide-in/out effects with bounce

## 🏗️ Architecture

### Components

**1. GlobalNotificationToast.js** (Main Toast Component)
- Location: `components/GlobalNotificationToast.js`
- Displays toast notifications with full details
- Handles click navigation to order/reservation details
- Manages notification queue and auto-dismiss
- Responsive design with animations

**2. NotificationContext.js** (State Management)
- Location: `context/NotificationContext.js`
- Manages notification state via React Context
- Handles real-time polling (every 6 seconds)
- Handles SSE connection (Server-Sent Events)
- Prevents duplicate notifications (6-second debounce)
- Plays audio alert automatically

### Utilities

**3. toastHelper.js** (Helper Functions)
- Location: `lib/toastHelper.js`
- Format functions: `formatCurrency()`, `formatTime()`, `formatFullDateTime()`
- Toast helper functions: `getToastIcon()`, `getToastTitle()`, `getToastColors()`

## 🚀 How It Works

### Real-Time Flow

```
1. New Order Created
   ↓
2. Server Event via SSE or Polling
   ↓
3. NotificationContext detects new order
   ↓
4. Plays audio (notification.wav)
   ↓
5. GlobalNotificationToast displays toast
   ↓
6. Toast slides in from right (animation)
   ↓
7. Admin can click to view details
   ↓
8. Toast auto-hides after 5 seconds
```

### Deduplication

- Uses timestamp-based deduplication (6-second blocking period)
- Prevents same notification from showing twice
- ID tracking with `lastOrderIdRef` and `lastNotificationTimeRef`

## 📱 Usage in Components

### In Admin Dashboard

The toast system is **automatic** - it triggers whenever the `notification` context updates.

```javascript
import { useNotification } from '../../context/NotificationContext'

export default function AdminDashboard() {
  const { notification, notificationType } = useNotification()

  // Toast appears automatically when notification updates
  // No additional setup needed!
}
```

### Using Toast Helper Functions

```javascript
import {
  formatCurrency,
  formatTime,
  getToastTitle,
  getToastColors
} from '../../lib/toastHelper'

// Format amount: ₹450
const amount = formatCurrency(450)

// Format time: 2:30:45 PM
const time = formatTime(new Date())

// Get title based on type
const title = getToastTitle('order') // "New Order Received!"
```

## 🎨 UI Components

### Toast Layout

```
┌─────────────────────────────────────┐
│  🔥 New Order Received!       ✨    │
│  2:30:45 PM                        │
│  ─────────────────────────────────  │
│  Order ID: #PETUK-20251219-abc123   │
│  From: Sourav Mandal               │
│  Amount: ₹450                      │
│  ─────────────────────────────────  │
│  Tap to view details           → View
└─────────────────────────────────────┘
```

### Colors & Styles

**Orders:**
- Icon: 🔥 (animated bounce)
- Border: Orange (#FF7A00)
- Glow: Orange shadow effect
- Gradient: from-orange-950/40 to-orange-900/20

**Reservations:**
- Icon: 📅 (animated bounce)
- Border: Blue (#3B82F6)
- Glow: Blue shadow effect
- Gradient: from-blue-950/40 to-blue-900/20

## 📊 Data Flow

### Order Notification Structure

```javascript
{
  order_id: "PETUK-20251219-abc123",
  customer_name: "Sourav Mandal",
  customer: { name: "Sourav Mandal" },
  total: 450,
  status: "placed",
  created_at: "2025-12-19T14:30:00Z"
}
```

### Reservation Notification Structure

```javascript
{
  id: "ddb200d7",
  name: "Anush Sharma",
  customer_name: "Anush Sharma",
  num_people: 2,
  time: "7:30 PM",
  phone: "9876543210",
  created_at: "2025-12-19T14:30:00Z"
}
```

## ⚙️ Configuration

### Polling Interval
- **Current:** 6 seconds
- **File:** `context/NotificationContext.js` line 91
- **Change:** Modify the interval in `setInterval(..., 6000)`

### Notification Debounce
- **Current:** 6 seconds
- **File:** `context/NotificationContext.js` line 19
- **Purpose:** Prevents duplicate notifications within 6 seconds
- **Change:** Modify the comparison `if (timeSinceLastNotification < 6000)`

### Toast Display Duration
- **Current:** 5 seconds
- **File:** `components/GlobalNotificationToast.js` line 39
- **Change:** Modify the timeout `setTimeout(() => {...}, 5000)`

### Toast Position
- **Current:** Top-right corner
- **File:** `components/GlobalNotificationToast.js` line 48
- **Classes:** `fixed top-20 right-6`
- **Change:** Modify to `top-20 left-6` for top-left, etc.

## 🔊 Sound Notification

Audio file location: `/public/notification.wav`

The sound automatically plays when:
1. A new order arrives
2. A new reservation arrives
3. Not played on duplicates (within 6-second window)

To use a different sound:
1. Replace `/public/notification.wav` with your audio file
2. Keep the same filename
3. Supported formats: .wav, .mp3, .ogg

## 📱 Mobile Responsiveness

Toast automatically adapts to screen size:

```
Desktop (1024px+): Full width (384px / w-96)
Tablet (768px):   Full width with less padding
Mobile (320px):   Responsive width with adjusted spacing
```

## 🧪 Testing

### Test New Order Notification

1. Go to Admin Dashboard: `http://localhost:3000/admin/dashboard`
2. Create a new order from customer site
3. Should see orange toast appear at top-right
4. Shows order details
5. Click toast → Opens order details page
6. Toast auto-hides after 5 seconds

### Test New Reservation Notification

1. Create a new reservation from `/reserve` page
2. Should see blue toast appear at top-right
3. Shows reservation details
4. Click toast → Opens reservation details page
5. Toast auto-hides after 5 seconds

### Test Multiple Notifications

1. Create 3 orders quickly in succession
2. Should see toasts queue (stack vertically)
3. Each toast has own timer
4. No overlapping or blocking

### Test Sound

1. Create any order/reservation
2. Should hear audio alert (ding sound)
3. Sound plays only ONCE per notification
4. Volume at 100%

## 🔄 Real-Time Mechanisms

### SSE (Server-Sent Events)
- Connection: `/api/admin/orders/events`
- Events: `new-order`, `new-reservation`
- Status: Connected when readyState = 1

### Polling Fallback
- Endpoint: `/api/admin/orders`
- Interval: Every 6 seconds
- Fallback if SSE fails
- Gets latest orders and reservations

### Authentication
- All requests require Bearer token
- Token stored in `localStorage.admin_token`
- Automatically included in headers

## 🛠️ Troubleshooting

### Toast Not Appearing

1. Check browser console for errors
2. Verify `notification` state is updating
3. Check if `GlobalNotificationToast` is wrapped in `NotificationProvider`
4. Verify token is in localStorage

### Sound Not Playing

1. Check `/public/notification.wav` exists
2. Browser might block audio (click to unmute)
3. Check browser console for audio errors
4. Verify volume is not muted

### Duplicates Appearing

1. Check debounce time is 6+ seconds
2. Verify `lastNotificationTimeRef` is updating
3. Check polling interval is appropriate

### Toast Not Disappearing

1. Check auto-hide timeout is set correctly (5000ms)
2. Verify `setIsExiting` is triggered
3. Check animation CSS is loaded

## 📚 Integration Checklist

- [x] GlobalNotificationToast component created
- [x] NotificationContext with polling/SSE set up
- [x] Toast helper utilities created
- [x] Click navigation working
- [x] Sound notification configured
- [x] Animation effects added
- [x] Mobile responsive design
- [x] Notification queue system
- [x] Deduplication system
- [x] Auto-dismiss timer
- [x] Console logging for debugging

## 🔗 Related Files

- **Toast Component:** `components/GlobalNotificationToast.js`
- **State Management:** `context/NotificationContext.js`
- **Helper Functions:** `lib/toastHelper.js`
- **Dashboard Integration:** `pages/admin/dashboard.js`
- **Audio File:** `public/notification.wav`
- **API Endpoint:** `pages/api/admin/orders/index.js`
- **SSE Endpoint:** `pages/api/admin/orders/events.js`

## 📞 Support

For issues or customization:

1. Check console logs with 🎯, 📦, 🍽️, 🔊 prefixes
2. Verify API endpoints are responding
3. Check authentication token
4. Review NotificationContext state

---

**Status:** ✅ Production Ready
**Last Updated:** December 19, 2025
**Version:** 1.0
