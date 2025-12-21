'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useNotification } from '../../context/NotificationContext'

export default function AdminOrders() {
  const router = useRouter()
  const { notification, notificationType } = useNotification()
  const [orders, setOrders] = useState([])
  const [reservations, setReservations] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [filteredReservations, setFilteredReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('orders')

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) router.push('/admin/login')
    else fetchData()
  }, [])

  // ✅ FIXED: Do NOT update orders/reservations on socket notifications
  // This was causing random loader triggers from background socket events
  // Instead, the NotificationContext handles listening to socket events
  // and broadcast them. We only need to fetch data on component mount.
  // Keep this commented out to prevent unnecessary re-renders
  /*
  useEffect(() => {
    if (!notification) return

    const source = 'socket'; // WebSocket events

    if (notificationType === 'order') {
      console.log('🎯 [ORDERS PAGE] New order notification received:', notification.order_id, '- Source:', source)
      
      setOrders(prev => {
        const exists = prev.some(o => o.order_id === notification.order_id)
        
        if (exists) {
          console.log('📝 Order already in list, updating:', notification.order_id)
          return prev.map(o => o.order_id === notification.order_id ? notification : o)
        }
        
        console.log('✨ Adding new order to list:', notification.order_id)
        return [notification, ...prev]
      })
    } else if (notificationType === 'reservation') {
      console.log('🎯 [ORDERS PAGE] New reservation notification received:', notification.id, '- Source:', source)
      
      setReservations(prev => {
        const exists = prev.some(r => r.id === notification.id)
        
        if (exists) {
          console.log('📝 Reservation already in list, updating:', notification.id)
          return prev.map(r => r.id === notification.id ? notification : r)
        }
        
        console.log('✨ Adding new reservation to list:', notification.id)
        return [notification, ...prev]
      })
    }
  }, [notification, notificationType])
  */

  useEffect(() => {
    filterOrders()
    filterReservations()
  }, [orders, reservations, statusFilter, searchTerm])

  const fetchData = async () => {
    try {
      // ✅ Global loader (via fetch interceptor) handles the loading
      // Don't call setLoading separately - it breaks the smart loading
      const token = localStorage.getItem('admin_token')
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setOrders(data.orders || [])
        setReservations(data.reservations || [])
        console.log('✅ [ORDERS] Data fetched successfully');
      }
      // Local loading state is just for page-level UI
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter)
    }
    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer?.phone?.includes(searchTerm) ||
        o.order_id?.includes(searchTerm)
      )
    }
    // Sort by newest first
    filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    setFilteredOrders(filtered)
  }

  const filterReservations = () => {
    let filtered = reservations
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone?.includes(searchTerm) ||
        r.id?.includes(searchTerm)
      )
    }
    // Sort by newest first
    filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    setFilteredReservations(filtered)
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('admin_token')
      
      // Optimistic update - update UI immediately
      setOrders(prev => 
        prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o)
      )
      
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (res.ok) {
        console.log('✅ Order status updated:', orderId, '→', newStatus)
        // No need to fetch all data - UI already updated
      } else {
        // Revert optimistic update on error
        await fetchData()
        const error = await res.json()
        console.error('❌ Failed to update order:', res.status, error)
        alert('Failed to update order: ' + (error.error || res.statusText))
      }
    } catch (err) {
      // Revert optimistic update on error
      await fetchData()
      console.error('❌ Failed to update order:', err)
      alert('Failed to update order: ' + err.message)
    }
  }

  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      const token = localStorage.getItem('admin_token')
      
      // Optimistic update - update UI immediately
      setReservations(prev =>
        prev.map(r => r.id === reservationId ? { ...r, status: newStatus } : r)
      )
      
      const res = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (res.ok) {
        console.log('✅ Reservation status updated:', reservationId, '→', newStatus)
        // No need to fetch all data - UI already updated
      } else {
        // Revert optimistic update on error
        await fetchData()
        const error = await res.json()
        console.error('❌ Failed to update reservation:', res.status, error)
        alert('Failed to update reservation: ' + (error.error || res.statusText))
      }
    } catch (err) {
      // Revert optimistic update on error
      await fetchData()
      console.error('❌ Failed to update reservation:', err)
      alert('Failed to update reservation: ' + err.message)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen text-[var(--petuk-orange)]">Loading...</div>

  return (
    <div className="min-h-screen bg-[var(--petuk-charcoal)]">
      {/* Header */}
      <header className="bg-black/50 border-b border-[var(--petuk-orange)]/30 sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-xl font-bold text-[var(--petuk-orange)]">Order Management</h1>
          <button
            onClick={() => {
              localStorage.removeItem('adminToken')
              router.push('/admin/login')
            }}
            className="group flex items-center justify-start w-11 h-11 bg-red-600 rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-lg hover:w-32 hover:rounded-lg active:translate-x-1 active:translate-y-1"
          >
            <div className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-3">
              <svg className="w-4 h-4" viewBox="0 0 512 512" fill="white">
                <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
              </svg>
            </div>
            <div className="absolute right-5 transform translate-x-full opacity-0 text-white text-lg font-semibold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              Logout
            </div>
          </button>
        </div>
      </header>

      <div className="container py-6">
        {/* Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { href: '/admin/dashboard', label: 'Dashboard' },
            { href: '/admin/orders', label: 'Orders' },
            { href: '/admin/payments', label: 'Payments' },
            { href: '/admin/menu', label: 'Menu' },
            { href: '/admin/settings', label: 'Settings' },
            { href: '/admin/analytics', label: 'Analytics' }
          ].map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 rounded whitespace-nowrap text-sm font-semibold transition ${
                router.pathname === tab.href
                  ? 'bg-[var(--petuk-orange)] text-white'
                  : 'bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 text-[var(--petuk-offwhite)] hover:border-[var(--petuk-orange)]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search by customer name, phone, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] focus:border-[var(--petuk-orange)] outline-none"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] focus:border-[var(--petuk-orange)] outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="placed">Placed</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded font-semibold transition ${
              activeTab === 'orders'
                ? 'bg-[var(--petuk-orange)] text-white'
                : 'bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 text-[var(--petuk-offwhite)]'
            }`}
          >
            📦 Food Orders ({filteredOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-2 rounded font-semibold transition ${
              activeTab === 'reservations'
                ? 'bg-[var(--petuk-orange)] text-white'
                : 'bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 text-[var(--petuk-offwhite)]'
            }`}
          >
            🍽️ Table Reservations ({filteredReservations.length})
          </button>
        </div>

        {/* Food Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-6 text-center text-gray-400">
                No orders found
              </div>
            ) : (
              filteredOrders.map(order => (
                <div key={order.order_id} className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-4 hover:border-[var(--petuk-orange)]/60 transition">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-400">Order ID</div>
                      <div className="text-lg font-bold text-[var(--petuk-orange)]">{order.order_id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Customer</div>
                      <div className="text-[var(--petuk-offwhite)]">{order.customer?.name}</div>
                      <div className="text-xs text-gray-400">{order.customer?.phone}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Total</div>
                      <div className="text-xl font-bold text-[var(--petuk-orange)]">₹{order.total}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Status</div>
                      <div className={`text-sm font-semibold mt-1 ${order.status === 'delivered' ? 'text-green-400' : order.status === 'cancelled' ? 'text-red-400' : 'text-orange-400'}`}>
                        {order.status}
                      </div>
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

                  {/* Status Update */}
                  <div className="border-t border-[var(--petuk-orange)]/20 pt-4 flex flex-wrap gap-2">
                    {order.status === 'placed' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.order_id, 'confirmed')}
                          className="px-4 py-2 text-sm rounded font-semibold transition bg-green-600 text-white hover:bg-green-700"
                        >
                          ✓ Confirm Order
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.order_id, 'cancelled')}
                          className="px-4 py-2 text-sm rounded font-semibold transition bg-red-600 text-white hover:bg-red-700"
                        >
                          ✕ Cancel Order
                        </button>
                      </>
                    )}
                    {order.status !== 'placed' && order.status !== 'cancelled' && (
                      <>
                        {['confirmed', 'preparing', 'ready', 'delivered'].map(status => (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(order.order_id, status)}
                            className={`px-3 py-1 text-xs rounded font-semibold transition ${
                              order.status === status
                                ? 'bg-[var(--petuk-orange)] text-white'
                                : 'bg-black/30 border border-[var(--petuk-orange)]/30 text-[var(--petuk-offwhite)] hover:border-[var(--petuk-orange)]'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                        <button
                          onClick={() => updateOrderStatus(order.order_id, 'cancelled')}
                          className="px-3 py-1 text-xs rounded font-semibold transition bg-red-900/30 border border-red-500/50 text-red-400 hover:bg-red-900/50"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    {order.address && <div>Address: {order.address}</div>}
                    {order.instructions && <div>Instructions: {order.instructions}</div>}
                    {order.createdAt && <div>Ordered at: {new Date(order.createdAt).toLocaleString()}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="space-y-4">
            {filteredReservations.length === 0 ? (
              <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-6 text-center text-gray-400">
                No reservations found
              </div>
            ) : (
              filteredReservations.map(reservation => (
                <div key={reservation.id} className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-4 hover:border-[var(--petuk-orange)]/60 transition">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-400">Reservation ID</div>
                      <div className="text-lg font-bold text-[var(--petuk-orange)]">{reservation.id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Customer</div>
                      <div className="text-[var(--petuk-offwhite)]">{reservation.name}</div>
                      <div className="text-xs text-gray-400">{reservation.phone}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Date & Time</div>
                      <div className="text-[var(--petuk-offwhite)]">{reservation.date} @ {reservation.time}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Status</div>
                      <div className={`text-sm font-semibold mt-1 ${
                        reservation.status === 'accepted' ? 'text-green-400' : 
                        reservation.status === 'cancelled' ? 'text-red-400' : 
                        'text-yellow-400'
                      }`}>
                        {reservation.status}
                      </div>
                    </div>
                  </div>

                  {/* Reservation Details */}
                  <div className="border-t border-[var(--petuk-orange)]/20 pt-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-400">Party Size</div>
                        <div className="text-[var(--petuk-offwhite)]">{reservation.size} {parseInt(reservation.size) === 1 ? 'person' : 'people'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Special Requests</div>
                        <div className="text-[var(--petuk-offwhite)] text-sm">{reservation.note || 'None'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Status Update */}
                  {(reservation.status === 'pending' || reservation.status !== 'pending') && (
                    <div className="border-t border-[var(--petuk-orange)]/20 pt-4 flex flex-wrap gap-2">
                      {reservation.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateReservationStatus(reservation.id, 'accepted')}
                            className="px-4 py-2 text-sm rounded font-semibold transition bg-green-600 text-white hover:bg-green-700"
                          >
                            ✓ Accept Reservation
                          </button>
                          <button
                            onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                            className="px-4 py-2 text-sm rounded font-semibold transition bg-red-600 text-white hover:bg-red-700"
                          >
                            ✕ Cancel Reservation
                          </button>
                        </>
                      )}
                      {reservation.status === 'accepted' && (
                        <>
                          <span className="px-4 py-2 text-sm font-semibold text-green-400">✓ Reservation Accepted</span>
                          <button
                            onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                            className="px-4 py-2 text-sm rounded font-semibold transition bg-red-600 text-white hover:bg-red-700"
                          >
                            ✕ Cancel Reservation
                          </button>
                        </>
                      )}
                      {reservation.status === 'cancelled' && (
                        <span className="px-4 py-2 text-sm font-semibold text-red-400">✕ Reservation Cancelled</span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-500">
                    Booked at: {new Date(reservation.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

