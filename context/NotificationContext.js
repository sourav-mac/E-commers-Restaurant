import { createContext, useContext, useEffect, useState } from 'react'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null)
  const [notificationType, setNotificationType] = useState(null) // 'order' or 'reservation'

  useEffect(() => {
    // Only run on client side and if we're in admin context
    const isAdminPage = typeof window !== 'undefined' && 
      (window.location.pathname.includes('/admin') || window.location.pathname.includes('/orders'))
    
    if (!isAdminPage) return

    const token = localStorage.getItem('adminToken')
    if (!token) return

    console.log('🔔 NotificationProvider: Setting up SSE connection')
    
    let es
    try {
      es = new EventSource(`/api/admin/orders/events?token=${encodeURIComponent(token)}`)
      
      es.addEventListener('new-order', (e) => {
        try {
          console.log('📦 [GLOBAL] Received new-order event')
          const order = JSON.parse(e.data)
          
          // Play notification sound
          try {
            const audio = new Audio('/notification.wav')
            audio.volume = 0.8
            audio.play().catch(err => console.log('Audio play blocked:', err))
          } catch (err) {
            console.log('Could not play notification sound:', err)
          }

          // Set global notification
          setNotificationType('order')
          setNotification(order)
          
          // Auto-hide after 7s
          setTimeout(() => {
            setNotification(null)
            setNotificationType(null)
          }, 7000)
        } catch (err) {
          console.error('Invalid SSE payload for order', err)
        }
      })

      es.addEventListener('new-reservation', (e) => {
        try {
          console.log('🍽️ [GLOBAL] Received new-reservation event')
          const reservation = JSON.parse(e.data)
          
          // Play notification sound
          try {
            const audio = new Audio('/notification.wav')
            audio.volume = 0.8
            audio.play().catch(err => console.log('Audio play blocked:', err))
          } catch (err) {
            console.log('Could not play notification sound:', err)
          }

          // Set global notification
          setNotificationType('reservation')
          setNotification(reservation)
          
          // Auto-hide after 7s
          setTimeout(() => {
            setNotification(null)
            setNotificationType(null)
          }, 7000)
        } catch (err) {
          console.error('Invalid SSE payload for reservation', err)
        }
      })

      es.onerror = (err) => {
        console.error('❌ [GLOBAL] EventSource error:', err)
      }

      console.log('✅ [GLOBAL] EventSource connected')
    } catch (err) {
      console.error('EventSource setup failed:', err)
    }

    return () => {
      if (es) {
        console.log('🔌 [GLOBAL] Closing EventSource')
        es.close()
      }
    }
  }, [])

  return (
    <NotificationContext.Provider value={{ notification, notificationType }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  return useContext(NotificationContext)
}
