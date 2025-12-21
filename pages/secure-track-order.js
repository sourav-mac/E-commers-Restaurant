/**
 * Secure Track Order Page
 * Protected: Requires OTP login
 * 
 * Users can only track their own orders
 * Shows real-time order status and tracking
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useLoading } from '../context/LoadingContext'

export default function SecureTrackOrder() {
  const router = useRouter()
  const { showLoading, hideLoading } = useLoading()
  const [userPhone, setUserPhone] = useState('')
  const [authToken, setAuthToken] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { orderId } = router.query

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

  // Auto-select order if orderId provided in query
  useEffect(() => {
    if (orderId && orders.length > 0) {
      const order = orders.find(o => o.order_id === orderId)
      if (order) {
        setSelectedOrder(order)
      }
    }
  }, [orderId, orders])

  const checkAuthentication = () => {
    try {
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
      console.log('📦 [ORDERS] Fetching user orders...')
      const response = await fetch('/api/orders/my-orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401) {
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
    } catch (err) {
      console.error('❌ [ORDERS] Fetch error:', err)
      setError('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
    }
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
      default:
        return 'bg-gray-900/30 text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'placed':
        return '📋'
      case 'confirmed':
        return '✅'
      case 'preparing':
        return '👨‍🍳'
      case 'ready':
        return '🚀'
      case 'delivered':
        return '🏠'
      case 'cancelled':
        return '❌'
      default:
        return '❓'
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--petuk-orange)] mb-2">Track Your Order</h1>
            <p className="text-gray-400">📱 Logged in as: +91{userPhone}</p>
          </div>
          <Link
            href="/secure-my-orders"
            className="bg-[var(--petuk-orange)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--petuk-orange)]/90 transition"
          >
            ← Back to Orders
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
            ❌ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 p-4 rounded-lg">
              <h2 className="text-lg font-bold text-[var(--petuk-orange)] mb-4">Your Orders</h2>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-sm">No orders found</p>
              ) : (
                <div className="space-y-2">
                  {orders.map(order => (
                    <button
                      key={order.order_id}
                      onClick={() => setSelectedOrder(order)}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedOrder?.order_id === order.order_id
                          ? 'border-[var(--petuk-orange)] bg-[var(--petuk-orange)]/10'
                          : 'border-gray-700 hover:border-[var(--petuk-orange)]/50'
                      }`}
                    >
                      <p className="font-semibold text-[var(--petuk-offwhite)] text-sm">#{order.order_id}</p>
                      <p className="text-xs text-gray-400 mt-1">₹{order.total}</p>
                      <span className={`text-xs px-2 py-1 rounded mt-2 inline-block ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-2">
            {!selectedOrder ? (
              <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 p-8 rounded-lg text-center">
                <p className="text-gray-500 text-lg">Select an order to view details</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Order Header */}
                <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 p-6 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-[var(--petuk-orange)]">Order #{selectedOrder.order_id}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {new Date(selectedOrder.createdAt).toLocaleDateString()} • {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-lg font-semibold ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)} {selectedOrder.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-[var(--petuk-orange)]">₹{selectedOrder.total}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Items</p>
                      <p className="text-2xl font-bold text-[var(--petuk-offwhite)]">{selectedOrder.items?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-[var(--petuk-orange)] mb-4">Order Timeline</h3>
                  <div className="space-y-4">
                    {['placed', 'confirmed', 'preparing', 'ready', 'delivered'].map((status, idx) => {
                      const isCompleted = ['placed', 'confirmed', 'preparing', 'ready', 'delivered'].indexOf(status) <=
                        ['placed', 'confirmed', 'preparing', 'ready', 'delivered'].indexOf(selectedOrder.status || 'placed')
                      
                      return (
                        <div key={status} className="flex items-start gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            isCompleted
                              ? 'bg-[var(--petuk-orange)] text-black'
                              : 'bg-gray-700 text-gray-400'
                          }`}>
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <div>
                            <p className={`font-semibold ${isCompleted ? 'text-[var(--petuk-offwhite)]' : 'text-gray-500'}`}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </p>
                            {isCompleted && (
                              <p className="text-xs text-gray-400 mt-1">Completed</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Items */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-[var(--petuk-orange)] mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-start justify-between pb-3 border-b border-gray-700 last:border-0">
                          <div className="flex-1">
                            <p className="font-semibold text-[var(--petuk-offwhite)]">{item.name}</p>
                            <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-[var(--petuk-orange)]">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Address */}
                {selectedOrder.address && (
                  <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-[var(--petuk-orange)] mb-4">Delivery Address</h3>
                    <p className="text-[var(--petuk-offwhite)]">{selectedOrder.address}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
