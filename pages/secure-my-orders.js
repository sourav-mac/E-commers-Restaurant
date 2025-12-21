/**
 * Secure My Orders Page
 * Protected: Requires OTP login
 * 
 * Shows only the logged-in user's orders
 * All requests are authenticated via JWT token
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CancelOrderModal from '../components/CancelOrderModal'
import CancelReservationModal from '../components/CancelReservationModal'
import { useLoading } from '../context/LoadingContext'

export default function SecureMyOrders() {
  const router = useRouter()
  const { showLoading, hideLoading } = useLoading()
  const [userPhone, setUserPhone] = useState('')
  const [authToken, setAuthToken] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [orders, setOrders] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('orders')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelResModalOpen, setCancelResModalOpen] = useState(false)
  const [selectedRestoCancel, setSelectedRestoCancel] = useState(null)
  const [cancelResLoading, setCancelResLoading] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication()
  }, [])

  // Fetch user's orders when authenticated
  useEffect(() => {
    if (isAuthenticated && authToken) {
      fetchUserOrders()
    }
  }, [isAuthenticated, authToken])

  const checkAuthentication = () => {
    try {
      // Get token and phone from localStorage
      const token = localStorage.getItem('auth_token')
      const phone = localStorage.getItem('user_phone')

      if (!token || !phone) {
        console.log('🔓 [AUTH] Not authenticated. Redirecting to login...')
        router.push('/auth/login')
        return
      }

      setAuthToken(token)
      setUserPhone(phone)
      setIsAuthenticated(true)
      setLoading(false)
      console.log(`✅ [AUTH] Authenticated user: +91${phone}`)
    } catch (err) {
      console.error('❌ [AUTH] Check auth error:', err)
      router.push('/auth/login')
    }
  }

  const fetchUserOrders = async () => {
    setLoading(true)
    setError('')

    try {
      // Fetch orders using authenticated token
      console.log('📦 [ORDERS] Fetching user orders...')
      const response = await fetch('/api/orders/my-orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401) {
        // Token expired or invalid
        console.log('⏰ [AUTH] Token expired. Logging out...')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_phone')
        router.push('/auth/login')
        return
      }

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to load orders')
        setLoading(false)
        return
      }

      const data = await response.json()
      console.log('✅ [ORDERS] Orders fetched:', data)
      setOrders(data.orders || [])
      setReservations(data.reservations || [])
    } catch (err) {
      console.error('❌ [ORDERS] Fetch error:', err)
      setError('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      console.error('Logout error:', err)
    }

    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_phone')
    router.push('/auth/login')
  }

  const canCancelOrder = (order) => {
    if (!order) return false
    const cancellableStatuses = ['placed', 'confirmed', 'ready']
    return cancellableStatuses.includes(order.status)
  }

  const handleOpenCancelModal = (order) => {
    setSelectedOrderToCancel(order)
    setCancelModalOpen(true)
  }

  const handleCloseCancelModal = () => {
    setCancelModalOpen(false)
    setSelectedOrderToCancel(null)
  }

  const handleConfirmCancel = async (reason) => {
    if (!selectedOrderToCancel) return

    setCancelLoading(true)
    showLoading('Cancelling order...')

    try {
      const res = await fetch(`/api/orders/${selectedOrderToCancel.order_id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ reason })
      })

      const data = await res.json()

      if (res.ok) {
        setOrders(prev =>
          prev.map(o =>
            o.order_id === selectedOrderToCancel.order_id
              ? { ...o, status: 'cancelled', cancelledAt: data.order.cancelledAt }
              : o
          )
        )
        handleCloseCancelModal()
        alert('✅ Order cancelled successfully')
      } else {
        alert('❌ ' + (data.error || 'Failed to cancel order'))
      }
    } catch (err) {
      console.error('Cancel error:', err)
      alert('❌ Failed to cancel order')
    } finally {
      setCancelLoading(false)
      hideLoading()
    }
  }

  const canCancelReservation = (reservation) => {
    if (!reservation) return false
    const cancellableStatuses = ['pending', 'accepted']
    return cancellableStatuses.includes(reservation.status)
  }

  const handleOpenCancelResModal = (reservation) => {
    setSelectedRestoCancel(reservation)
    setCancelResModalOpen(true)
  }

  const handleCloseCancelResModal = () => {
    setCancelResModalOpen(false)
    setSelectedRestoCancel(null)
  }

  const handleConfirmCancelRes = async (reason) => {
    if (!selectedRestoCancel) return

    setCancelResLoading(true)
    showLoading('Cancelling reservation...')

    try {
      const res = await fetch(`/api/reservations/${selectedRestoCancel.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ reason })
      })

      const data = await res.json()

      if (res.ok) {
        setReservations(prev =>
          prev.map(r =>
            r.id === selectedRestoCancel.id
              ? { ...r, status: 'cancelled', cancelledAt: data.reservation.cancelledAt }
              : r
          )
        )
        handleCloseCancelResModal()
        alert('✅ Reservation cancelled successfully')
      } else {
        alert('❌ ' + (data.error || 'Failed to cancel reservation'))
      }
    } catch (err) {
      console.error('Cancel error:', err)
      alert('❌ Failed to cancel reservation')
    } finally {
      setCancelResLoading(false)
      hideLoading()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--petuk-charcoal)] flex items-center justify-center">
        <div className="text-[var(--petuk-orange)] text-center">
          <div className="text-2xl mb-4">⏳</div>
          <p>Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--petuk-charcoal)] flex flex-col">
      <Header />

      <main className="flex-1 container py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--petuk-orange)] mb-2">My Orders & Reservations</h1>
            <p className="text-gray-400">📱 Logged in as: +91{userPhone}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            🔓 Logout
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
            ❌ {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[var(--petuk-orange)]/20">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'orders'
                ? 'border-[var(--petuk-orange)] text-[var(--petuk-orange)]'
                : 'border-transparent text-gray-400 hover:text-[var(--petuk-offwhite)]'
            }`}
          >
            🍽️ Food Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'reservations'
                ? 'border-[var(--petuk-orange)] text-[var(--petuk-orange)]'
                : 'border-transparent text-gray-400 hover:text-[var(--petuk-offwhite)]'
            }`}
          >
            🪑 Table Reservations ({reservations.length})
          </button>
        </div>

        {/* Empty State */}
        {activeTab === 'orders' && orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No food orders found</p>
            <Link
              href="/menu"
              className="bg-[var(--petuk-orange)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--petuk-orange)]/90 inline-block transition"
            >
              🍽️ Order Food
            </Link>
          </div>
        )}

        {activeTab === 'reservations' && reservations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No table reservations found</p>
            <Link
              href="/reserve"
              className="bg-[var(--petuk-orange)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--petuk-orange)]/90 inline-block transition"
            >
              🪑 Reserve Table
            </Link>
          </div>
        )}

        {/* Orders List */}
        {activeTab === 'orders' && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order.order_id}
                className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 p-6 rounded-lg hover:border-[var(--petuk-orange)] transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--petuk-orange)]">Order #{order.order_id}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    order.status === 'placed' ? 'bg-blue-900/30 text-blue-400' :
                    order.status === 'confirmed' ? 'bg-green-900/30 text-green-400' :
                    order.status === 'preparing' ? 'bg-yellow-900/30 text-yellow-400' :
                    order.status === 'ready' ? 'bg-purple-900/30 text-purple-400' :
                    order.status === 'delivered' ? 'bg-emerald-900/30 text-emerald-400' :
                    order.status === 'cancelled' ? 'bg-red-900/30 text-red-400' :
                    'bg-gray-900/30 text-gray-400'
                  }`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Items</p>
                    <p className="text-sm text-[var(--petuk-offwhite)]">
                      {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total</p>
                    <p className="text-sm font-semibold text-[var(--petuk-orange)]">₹{order.total || 0}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/secure-track-order?orderId=${order.order_id}`}
                    className="flex-1 bg-[var(--petuk-orange)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--petuk-orange)]/90 transition text-center text-sm"
                  >
                    👁️ View Details
                  </Link>

                  {canCancelOrder(order) && (
                    <button
                      onClick={() => handleOpenCancelModal(order)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                    >
                      ✕ Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reservations List */}
        {activeTab === 'reservations' && reservations.length > 0 && (
          <div className="space-y-4">
            {reservations.map(res => (
              <div
                key={res.id}
                className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 p-6 rounded-lg hover:border-[var(--petuk-orange)] transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--petuk-orange)]">Reservation #{res.id}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(res.date).toLocaleDateString()} at {res.time}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    res.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                    res.status === 'accepted' ? 'bg-green-900/30 text-green-400' :
                    res.status === 'cancelled' ? 'bg-red-900/30 text-red-400' :
                    'bg-gray-900/30 text-gray-400'
                  }`}>
                    {res.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Party Size</p>
                    <p className="text-sm text-[var(--petuk-offwhite)]">{res.size} people</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-[var(--petuk-offwhite)]">{res.note || 'N/A'}</p>
                  </div>
                </div>

                {canCancelReservation(res) && (
                  <button
                    onClick={() => handleOpenCancelResModal(res)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    ✕ Cancel Reservation
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <CancelOrderModal
        isOpen={cancelModalOpen}
        order={selectedOrderToCancel}
        onConfirm={handleConfirmCancel}
        onCancel={handleCloseCancelModal}
        isLoading={cancelLoading}
      />

      <CancelReservationModal
        isOpen={cancelResModalOpen}
        reservation={selectedRestoCancel}
        onConfirm={handleConfirmCancelRes}
        onCancel={handleCloseCancelResModal}
        isLoading={cancelResLoading}
      />

      <Footer />
    </div>
  )
}
