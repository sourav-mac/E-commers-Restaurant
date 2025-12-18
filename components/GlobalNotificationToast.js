import { useNotification } from '../context/NotificationContext'

export default function GlobalNotificationToast() {
  const { notification, notificationType } = useNotification()

  if (!notification) return null

  const isOrder = notificationType === 'order'
  const title = isOrder ? '🔔 New Order!' : '🔔 New Reservation!'
  const subtitle = isOrder 
    ? `Order ${notification.order_id || notification.id} from ${notification.customerName || 'Customer'}`
    : `Reservation from ${notification.name || 'Guest'}`

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in fade-in duration-300">
      <div className="bg-black border-2 border-orange-500 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-start gap-3">
          <div className="text-2xl">
            {isOrder ? '📦' : '🍽️'}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-orange-500 text-lg">{title}</h3>
            <p className="text-white text-sm mt-1">{subtitle}</p>
            {isOrder && notification.items && (
              <p className="text-gray-300 text-xs mt-2">
                {notification.items.length} item(s) • ₹{notification.total}
              </p>
            )}
          </div>
          <div className="text-orange-500 text-xl">✓</div>
        </div>
      </div>
    </div>
  )
}
