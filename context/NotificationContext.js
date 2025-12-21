import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null)
  const [notificationType, setNotificationType] = useState(null)
  const socketRef = useRef(null)
  const autoHideTimeoutRef = useRef(null)
  
  // Track ALL previously seen order and reservation IDs
  const previousOrderIds = useRef(new Set())
  const previousReservationIds = useRef(new Set())
  
  // Flag to prevent notifications on initial page load/first connection
  const isFirstLoadRef = useRef(true)

  // Function to display notification
  // `source` indicates where the notification originated: 'sse' | 'polling' | undefined
  const showNotification = (data, type, source = 'unknown') => {
    console.log('🎯 [SHOW NOTIFICATION] Displaying notification:', type, data.order_id || data.id, 'source:', source)
    
    // Clear any existing auto-hide timeout FIRST
    if (autoHideTimeoutRef.current) {
      clearTimeout(autoHideTimeoutRef.current)
      console.log('🎯 Cleared existing auto-hide timeout')
    }
    
    setNotificationType(type)
    setNotification(data)
    
    // Play sound only ONCE
    try {
      const audio = new Audio('/notification.wav')
      audio.volume = 1.0
      audio.currentTime = 0
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('🔊 ✅ Notification sound playing')
          })
          .catch(err => {
            console.log('🔊 Audio play blocked or failed:', err.message)
          })
      }
    } catch (err) {
      console.log('🔊 Error playing notification sound:', err)
    }
    
    // Auto-hide after 7 seconds
    autoHideTimeoutRef.current = setTimeout(() => {
      console.log('🎯 Auto-hiding notification after 7 seconds')
      setNotification(null)
      setNotificationType(null)
    }, 7000)
  }

  // Polling fallback to check for new orders
  const startPolling = () => {
    console.log('🔄 Polling fallback started - checking every 6 seconds')
    
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('admin_token')
        if (!token) return

        const res = await fetch('/api/admin/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (!res.ok) return
        
        const data = await res.json()
        
        // Process orders
        if (data.orders && data.orders.length > 0) {
          data.orders.forEach(order => {
            const orderId = order.order_id
            
            // Check if this is a NEW order we haven't seen before
            if (!previousOrderIds.current.has(orderId)) {
              // Only show notification if NOT the first load
              if (!isFirstLoadRef.current) {
                console.log('🎯 [POLLING] NEW order detected:', orderId)
                showNotification(order, 'order', 'polling')
              } else {
                console.log('📝 [POLLING] First load - adding order to set:', orderId)
              }
              // Add to our set of seen IDs
              previousOrderIds.current.add(orderId)
            } else {
              console.log('🔄 [POLLING] Order already seen:', orderId)
            }
          })
        }
        
        // Process reservations
        if (data.reservations && data.reservations.length > 0) {
          data.reservations.forEach(res => {
            const resId = res.id
            
            // Check if this is a NEW reservation we haven't seen before
            if (!previousReservationIds.current.has(resId)) {
              // Only show notification if NOT the first load
              if (!isFirstLoadRef.current) {
                console.log('🎯 [POLLING] NEW reservation detected:', resId)
                showNotification(res, 'reservation', 'polling')
              } else {
                console.log('📝 [POLLING] First load - adding reservation to set:', resId)
              }
              // Add to our set of seen IDs
              previousReservationIds.current.add(resId)
            } else {
              console.log('🔄 [POLLING] Reservation already seen:', resId)
            }
          })
        }
        
        // After first poll, mark first load as complete
        if (isFirstLoadRef.current) {
          isFirstLoadRef.current = false
          console.log('✅ First load complete - notifications enabled')
        }
        
      } catch (err) {
        console.log('🔄 [POLLING] Error:', err.message)
      }
    }, 6000) // Check every 6 seconds
    
    return () => clearInterval(pollInterval)
  }

  useEffect(() => {
    console.log('🔔 [NotificationProvider] useEffect starting')
    
    if (typeof window === 'undefined') return

    const pathname = window.location.pathname
    const isAdminContext = pathname.includes('/admin') || pathname.includes('/my-orders') || pathname.includes('/reserve')
    
    if (!isAdminContext) {
      console.log('🔔 Not admin context, skipping Socket.IO')
      return
    }

    const token = localStorage.getItem('admin_token')
    console.log('🔔 Checking token for Socket.IO:', token ? '✅ FOUND' : '❌ NOT FOUND')
    
    if (!token) {
      console.log('🔔 No token found, setting up polling fallback')
      startPolling()
      return
    }

    // Initialize Socket.IO connection
    console.log('🔔 ✅ Token found! Setting up Socket.IO connection')
    
    try {
      const socket = io(window.location.origin, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      })
      
      socketRef.current = socket

      socket.on('connect', () => {
        console.log('🔌 [Socket.IO] Connected! Socket ID:', socket.id)
        // Authenticate after connection
        socket.emit('authenticate', { token })
      })

      socket.on('authenticated', (data) => {
        if (data.success) {
          console.log('🔐 [Socket.IO] ✅ Authentication successful')
          // Mark first load complete to enable notifications
          isFirstLoadRef.current = false
          console.log('✅ Socket.IO ready - notifications enabled')
        } else {
          console.log('🔐 [Socket.IO] ❌ Authentication failed')
          startPolling()
        }
      })

      // Listen for new orders
      socket.on('orderCreated', (order) => {
        console.log('📦 [Socket.IO] New order received:', order.order_id)
        const orderId = order.order_id
        
        // Add to our set of seen IDs
        previousOrderIds.current.add(orderId)
        
        // Show notification only if NOT the first load
        if (!isFirstLoadRef.current) {
          console.log('🎯 [Socket.IO] Showing new order notification')
          showNotification(order, 'order', 'socket')
        } else {
          console.log('📝 [Socket.IO] First load - order added to set, no notification')
        }
      })

      // Listen for order cancellations
      socket.on('orderCancelled', (data) => {
        console.log('❌ [Socket.IO] Order cancelled:', data.order_id)
        // Broadcast cancellation notification to admin
        showNotification(data, 'orderCancelled', 'socket')
      })

      // Listen for reservation cancellations
      socket.on('reservationCancelled', (data) => {
        console.log('❌ [Socket.IO] Reservation cancelled:', data.id)
        // Broadcast cancellation notification to admin
        showNotification(data, 'reservationCancelled', 'socket')
      })

      // Listen for new reservations
      socket.on('reservationCreated', (reservation) => {
        console.log('🍽️ [Socket.IO] New reservation received:', reservation.id)
        const resId = reservation.id
        
        // Add to our set of seen IDs
        previousReservationIds.current.add(resId)
        
        // Show notification only if NOT the first load
        if (!isFirstLoadRef.current) {
          console.log('🎯 [Socket.IO] Showing new reservation notification')
          showNotification(reservation, 'reservation', 'socket')
        } else {
          console.log('📝 [Socket.IO] First load - reservation added to set, no notification')
        }
      })

      socket.on('disconnect', () => {
        console.log('🔌 [Socket.IO] Disconnected - switching to polling fallback')
        startPolling()
      })

      socket.on('error', (error) => {
        console.error('❌ [Socket.IO] Error:', error)
        startPolling()
      })

    } catch (err) {
      console.error('❌ Socket.IO setup FAILED:', err)
      startPolling()
    }

    return () => {
      if (socketRef.current) {
        console.log('🔌 Disconnecting Socket.IO on unmount')
        socketRef.current.disconnect()
        socketRef.current = null
      }
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current)
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
