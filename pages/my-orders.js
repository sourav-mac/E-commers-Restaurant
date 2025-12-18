'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function MyOrders() {
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [activeTab, setActiveTab] = useState('orders')

  // Load saved phone number and orders on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem('lastOrderSearchPhone')
    if (savedPhone) {
      setPhone(savedPhone)
      fetchData(savedPhone)
    }
  }, [])

  const fetchData = async (phoneNumber) => {
    setLoading(true)
    setError('')
    setOrders([])
    setReservations([])
    setSearched(true)

    try {
      const res = await fetch(`/api/orders/by-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      })

      const data = await res.json()
      console.log('📱 Search response:', data)
      
      if (res.ok) {
        setOrders(data.orders || [])
        setReservations(data.reservations || [])
        
        if ((data.orders?.length === 0) && (data.reservations?.length === 0)) {
          setError('No orders or reservations found for this phone number. Please check and try again.')
        }
        // Save phone number to localStorage
        localStorage.setItem('lastOrderSearchPhone', phoneNumber)
      } else {
        setError(data.error || 'Failed to fetch data')
      }
    } catch (err) {
      setError('Failed to fetch data. Please check your phone number and try again.')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (phone.trim()) {
      fetchData(phone)
    }
  }

  const handleClearSearch = () => {
    setPhone('')
    setOrders([])
    setReservations([])
    setError('')
    setSearched(false)
    localStorage.removeItem('lastOrderSearchPhone')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-900/30 text-blue-400'
      case 'confirmed':
        return 'bg-green-900/30 text-green-400'
      case 'preparing':
        return 'bg-yellow-900/30 text-yellow-400'
      case 'ready':
        return 'bg-purple-900/30 text-purple-400'
      case 'delivered':
        return 'bg-emerald-900/30 text-emerald-400'
      case 'cancelled':
        return 'bg-red-900/30 text-red-400'
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-400'
      case 'accepted':
        return 'bg-green-900/30 text-green-400'
      default:
        return 'bg-gray-900/30 text-gray-400'
    }
  }

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'placed':
        return '📝'
      case 'confirmed':
        return '✅'
      case 'preparing':
        return '👨‍🍳'
      case 'ready':
        return '📦'
      case 'delivered':
        return '🚚'
      case 'cancelled':
        return '❌'
      case 'pending':
        return '⏳'
      case 'accepted':
        return '✅'
      default:
        return '❓'
    }
  }

  return (
    <div>
      <Header />
      <main className="container py-6 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--petuk-orange)] mb-2">My Orders & Reservations</h1>
          <p className="text-sm md:text-base text-gray-400 mb-6 md:mb-8">Enter your phone number to see all your orders and reservations</p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 px-4 py-3 md:py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] focus:border-[var(--petuk-orange)] outline-none text-sm md:text-base"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-uiverse px-6 py-3 md:py-2 text-sm md:text-base whitespace-nowrap disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && searched && (
            <div className="bg-red-900/30 border border-red-500/50 rounded p-4 mb-6 text-red-400">
              {error}
            </div>
          )}

          {/* Tabs */}
          {(orders.length > 0 || reservations.length > 0) && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded font-semibold transition ${
                  activeTab === 'orders'
                    ? 'btn-uiverse'
                    : 'bg-transparent border border-[var(--petuk-orange)] text-[var(--petuk-offwhite)] hover:border-[var(--petuk-orange-light)]'
                }`}
              >
                📦 Food Orders ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('reservations')}
                className={`px-4 py-2 rounded font-semibold transition ${
                  activeTab === 'reservations'
                    ? 'btn-uiverse'
                    : 'bg-transparent border border-[var(--petuk-orange)] text-[var(--petuk-offwhite)] hover:border-[var(--petuk-orange-light)]'
                }`}
              >
                🍽️ Reservations ({reservations.length})
              </button>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.order_id} className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-6 hover:border-[var(--petuk-orange)]/60 transition">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Order ID</div>
                      <div className="text-lg font-bold text-[var(--petuk-orange)]">{order.order_id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Date & Time</div>
                      <div className="text-sm text-[var(--petuk-offwhite)]">{new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Amount</div>
                      <div className="text-xl font-bold text-[var(--petuk-orange)]">₹{order.total}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Status</div>
                      <span className={`inline-block px-3 py-1 rounded text-sm font-semibold mt-1 ${getStatusColor(order.status)}`}>
                        {getStatusEmoji(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="border-t border-[var(--petuk-orange)]/20 pt-4 mb-4">
                    <div className="text-sm font-semibold text-gray-400 mb-2">Items:</div>
                    <div className="space-y-1">
                      {order.items?.map((item, i) => (
                        <div key={i} className="text-sm text-[var(--petuk-offwhite)]">
                          • {item.name} × {item.qty} = ₹{item.itemTotal}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-[var(--petuk-orange)]/20 pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Subtotal:</span>
                      <div className="text-[var(--petuk-offwhite)]">₹{order.subtotal}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Tax:</span>
                      <div className="text-[var(--petuk-offwhite)]">₹{order.tax}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Delivery:</span>
                      <div className="text-[var(--petuk-offwhite)]">₹{order.delivery_fee}</div>
                    </div>
                    {order.discount > 0 && (
                      <div>
                        <span className="text-green-400">Discount:</span>
                        <div className="text-green-400">-₹{order.discount}</div>
                      </div>
                    )}
                  </div>

                  {/* Order Info */}
                  <div className="border-t border-[var(--petuk-orange)]/20 mt-4 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Payment:</span>
                      <div className="text-[var(--petuk-offwhite)]">{order.payment_method === 'razorpay' ? '💳 Online Payment' : '💵 Cash on Delivery'}</div>
                    </div>
                    {order.address && (
                      <div>
                        <span className="text-gray-400">Delivery Address:</span>
                        <div className="text-[var(--petuk-offwhite)]">{order.address}</div>
                      </div>
                    )}
                  </div>

                  {/* Status Message */}
                  <div className="border-t border-[var(--petuk-orange)]/20 mt-4 pt-4">
                    {order.status === 'placed' && (
                      <p className="text-blue-400 text-sm">⏳ Your order is placed. Waiting for admin confirmation...</p>
                    )}
                    {order.status === 'confirmed' && (
                      <p className="text-green-400 text-sm">✅ Your order has been confirmed! Kitchen is preparing...</p>
                    )}
                    {order.status === 'preparing' && (
                      <p className="text-yellow-400 text-sm">👨‍🍳 Your order is being prepared in the kitchen...</p>
                    )}
                    {order.status === 'ready' && (
                      <p className="text-purple-400 text-sm">📦 Your order is ready for delivery!</p>
                    )}
                    {order.status === 'delivered' && (
                      <p className="text-emerald-400 text-sm">🚚 Your order has been delivered. Thank you!</p>
                    )}
                    {order.status === 'cancelled' && (
                      <p className="text-red-400 text-sm">❌ This order has been cancelled.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reservations Tab */}
          {activeTab === 'reservations' && reservations.length > 0 && (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-6 hover:border-[var(--petuk-orange)]/60 transition">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Reservation ID</div>
                      <div className="text-lg font-bold text-[var(--petuk-orange)]">{reservation.id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Date & Time</div>
                      <div className="text-sm text-[var(--petuk-offwhite)]">{reservation.date} @ {reservation.time}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Party Size</div>
                      <div className="text-lg font-bold text-[var(--petuk-orange)]">{reservation.size} {parseInt(reservation.size) === 1 ? 'person' : 'people'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Status</div>
                      <span className={`inline-block px-3 py-1 rounded text-sm font-semibold mt-1 ${getStatusColor(reservation.status)}`}>
                        {getStatusEmoji(reservation.status)} {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Reservation Details */}
                  {reservation.note && (
                    <div className="border-t border-[var(--petuk-orange)]/20 pt-4 mb-4">
                      <div className="text-sm font-semibold text-gray-400 mb-2">Special Requests:</div>
                      <div className="text-sm text-[var(--petuk-offwhite)]">{reservation.note}</div>
                    </div>
                  )}

                  {/* Reservation Info */}
                  <div className="border-t border-[var(--petuk-orange)]/20 mt-4 pt-4 text-sm">
                    <div className="text-gray-400">Booked on:</div>
                    <div className="text-[var(--petuk-offwhite)]">{new Date(reservation.createdAt).toLocaleString()}</div>
                  </div>

                  {/* Status Message */}
                  <div className="border-t border-[var(--petuk-orange)]/20 mt-4 pt-4">
                    {reservation.status === 'pending' && (
                      <p className="text-yellow-400 text-sm">⏳ Your reservation is pending. We will call to confirm...</p>
                    )}
                    {reservation.status === 'accepted' && (
                      <p className="text-green-400 text-sm">✅ Your reservation has been confirmed! See you soon!</p>
                    )}
                    {reservation.status === 'cancelled' && (
                      <p className="text-red-400 text-sm">❌ This reservation has been cancelled.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searched && (
            <div className="text-center text-gray-400 py-8">
              <p className="text-lg">📱 Enter your phone number above to view your orders and reservations</p>
            </div>
          )}

          {searched && orders.length === 0 && reservations.length === 0 && !error && (
            <div className="text-center text-gray-400 py-8">
              <p className="text-lg">📭 No orders or reservations found</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
