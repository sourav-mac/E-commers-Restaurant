# 🎬 Global Loading - Quick Reference

## Import & Use

### Automatic (No code needed)
```javascript
// Fetch automatically shows loader
fetch('/api/endpoint')  // ✅ Works!
```

### Manual Control
```javascript
import { useLoading } from '../context/LoadingContext'

export default function MyComponent() {
  const { showLoading, hideLoading } = useLoading()

  const handleAction = async () => {
    showLoading('Loading...')  // Optional message
    try {
      // Your async code
    } finally {
      hideLoading()
    }
  }

  return <button onClick={handleAction}>Click</button>
}
```

### Helper Hook
```javascript
import { useLoadingState } from '../lib/useLoadingState'

export default function MyComponent() {
  const runWithLoading = useLoadingState()

  const handleAction = async () => {
    await runWithLoading(async () => {
      // Your async code
    }, 'Processing...')
  }

  return <button onClick={handleAction}>Click</button>
}
```

---

## API Reference

### `useLoading()` Hook

**Returns:**
```javascript
{
  isLoading,      // boolean - true if loading
  loadingMessage, // string - current message
  showLoading,    // function - show loader with optional message
  hideLoading     // function - hide loader
}
```

**Example:**
```javascript
const { showLoading, hideLoading } = useLoading()

showLoading('Saving...')  // Shows with message
showLoading()             // Shows without message
hideLoading()             // Hides
```

---

## Common Patterns

### Admin Page - Updating Item
```javascript
const updateItem = async (itemId, data) => {
  showLoading('Updating...')
  try {
    const res = await fetch(`/api/admin/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const result = await res.json()
    if (result.success) {
      // Show success toast
    }
  } finally {
    hideLoading()
  }
}
```

### User Page - Loading Data
```javascript
useEffect(() => {
  const loadData = async () => {
    showLoading('Loading...')
    try {
      const res = await fetch('/api/data')
      const data = await res.json()
      setData(data)
    } finally {
      hideLoading()
    }
  }
  loadData()
}, [])
```

### Quick Action - No Message
```javascript
const handleDelete = async (id) => {
  showLoading()
  try {
    await fetch(`/api/items/${id}`, { method: 'DELETE' })
  } finally {
    hideLoading()
  }
}
```

---

## Pages Updated ✅

- ✅ _app.js
- ✅ admin/dashboard.js
- ✅ admin/orders.js
- ✅ admin/menu.js
- ✅ checkout.js
- ✅ menu.js
- ✅ reserve.js
- ✅ track-order.js
- ✅ my-orders.js
- ✅ reviews.js
- ✅ cart.js

---

## Files Reference

| File | Purpose |
|------|---------|
| `context/LoadingContext.js` | State management |
| `components/GlobalLoader.js` | Loader UI |
| `lib/fetchInterceptor.js` | Auto-show on fetch |
| `lib/useLoadingState.js` | Helper hook |
| `pages/_app.js` | Setup & provider |

---

## Tips

💡 **For fetch calls:** Loader shows/hides automatically  
💡 **For route changes:** Loader shows/hides automatically  
💡 **For complex operations:** Use `showLoading()` manually  
💡 **For multiple operations:** Set counter in interceptor  
💡 **For messages:** `showLoading('Your message here')`  

---

**Status:** ✅ Live & Working
