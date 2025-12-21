'use client'

import { useNotification } from '../context/NotificationContext'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function GlobalNotificationToast() {
  const { notification, notificationType } = useNotification()
  const router = useRouter()
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    if (notification) {
      const toastId = Date.now()
      const newToast = {
        id: toastId,
        notification,
        type: notificationType,
        isExiting: false
      }

      console.log('🎯 [TOAST] Notification received, adding to queue:', newToast)
      setToasts(prev => [...prev, newToast])

      // Auto remove after 5 seconds
      const timer = setTimeout(() => {
        setToasts(prev =>
          prev.map(t => t.id === toastId ? { ...t, isExiting: true } : t)
        )

        // Remove from DOM after animation
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toastId))
        }, 300)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [notification, notificationType])

  const handleToastClick = (toast) => {
    if (toast.type === 'order') {
      router.push(`/admin/orders/${toast.notification.order_id}`)
    } else {
      router.push(`/admin/reservations/${toast.notification.id}`)
    }
  }

  return (
    <div className="fixed top-20 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(400px);
          }
        }
        .toast-enter {
          animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .toast-exit {
          animation: slideOutRight 0.3s ease-in;
        }
        .toast-glow {
          box-shadow: 0 0 25px rgba(255, 122, 0, 0.4), 0 0 50px rgba(255, 122, 0, 0.2);
        }
        .toast-glow-blue {
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.4), 0 0 50px rgba(59, 130, 246, 0.2);
        }
      `}</style>

      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto ${toast.isExiting ? 'toast-exit' : 'toast-enter'}`}
        >
          <div
            onClick={() => handleToastClick(toast)}
            className={`
              w-96 rounded-xl p-4 cursor-pointer backdrop-blur-md
              border transition-all duration-300 transform hover:scale-105
              ${
                toast.type === 'order'
                  ? 'bg-gradient-to-r from-orange-950/40 to-orange-900/20 border-orange-500/60 hover:border-orange-400 toast-glow'
                  : 'bg-gradient-to-r from-blue-950/40 to-blue-900/20 border-blue-500/60 hover:border-blue-400 toast-glow-blue'
              }
            `}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="text-3xl animate-bounce">
                  {toast.type === 'order' ? '🔥' : '📅'}
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${
                    toast.type === 'order' ? 'text-orange-400' : 'text-blue-400'
                  }`}>
                    {toast.type === 'order' ? 'New Order Received!' : 'New Reservation!'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(toast.notification.created_at || Date.now()).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className={`text-2xl ${toast.type === 'order' ? 'text-orange-500' : 'text-blue-500'}`}>
                ✨
              </div>
            </div>

            {/* Content */}
            <div className="ml-12 space-y-2">
              {/* Order/Reservation ID */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">
                  {toast.type === 'order' ? 'Order' : 'Reservation'} ID:
                </span>
                <span className={`font-bold text-sm ${
                  toast.type === 'order' ? 'text-orange-300' : 'text-blue-300'
                }`}>
                  #{toast.notification.order_id || toast.notification.id}
                </span>
              </div>

              {/* Customer Name */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">
                  {toast.type === 'order' ? 'From:' : 'By:'}
                </span>
                <span className="font-semibold text-gray-100 text-sm">
                  {toast.notification.customer_name || toast.notification.customer?.name || toast.notification.name || 'Guest'}
                </span>
              </div>

              {/* Amount (Orders only) */}
              {toast.type === 'order' && toast.notification.total && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Amount:</span>
                  <span className="font-bold text-orange-300 text-sm">
                    ₹{toast.notification.total}
                  </span>
                </div>
              )}

              {/* People & Time (Reservations only) */}
              {toast.type === 'reservation' && (
                <>
                  {toast.notification.num_people && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">People:</span>
                      <span className="font-semibold text-gray-100 text-sm">
                        {toast.notification.num_people} person(s)
                      </span>
                    </div>
                  )}
                  {toast.notification.time && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Time:</span>
                      <span className="font-semibold text-gray-100 text-sm">
                        {toast.notification.time}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer - Click to View */}
            <div className={`mt-3 pt-3 border-t ${
              toast.type === 'order' ? 'border-orange-500/30' : 'border-blue-500/30'
            } flex items-center justify-between`}>
              <span className="text-xs text-gray-500">Tap to view details</span>
              <span className={`text-sm font-bold ${
                toast.type === 'order' ? 'text-orange-400' : 'text-blue-400'
              }`}>
                → View
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
