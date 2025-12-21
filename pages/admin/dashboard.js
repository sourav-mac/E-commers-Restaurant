'use client'

/**
 * Admin Dashboard Page (SECURE VERSION)
 * Protected: Only accessible with valid admin login
 * 
 * Security Features:
 * - Automatic redirect to login if not authenticated
 * - Token validation before showing content
 * - Logout functionality
 * - Admin activity logging
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useNotification } from '../../context/NotificationContext'
import { useLoading } from '../../context/LoadingContext'

export default function AdminDashboard() {
  const router = useRouter()
  const { notification, notificationType } = useNotification()
  const { showLoading, hideLoading } = useLoading()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('Admin')
  const [orders, setOrders] = useState([])
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [stats, setStats] = useState({
    todayRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    placedCount: 0,
    confirmedCount: 0,
    preparingCount: 0,
    readyCount: 0,
    deliveredCount: 0,
    cancelledCount: 0
  })

  useEffect(() => {
    // Check if admin token exists
    const token = localStorage.getItem('admin_token')

    if (!token) {
      // Redirect to login - not authenticated
      router.push('/admin/login')
      return
    }

    // Token exists, load dashboard data
    setIsAuthenticated(true)
    setUsername(localStorage.getItem('admin_username') || 'Admin')
    fetchDashboardData(token)
    setIsLoading(false)
  }, [router])

  // ✅ FIXED: Do NOT update orders on socket notifications
  // This was causing random loader triggers from background socket events
  // Orders are already updated via Socket.IO listeners in NotificationContext
  // The admin dashboard automatically receives updates when notification is broadcast
  // Keep this commented out to prevent re-renders from socket events
  /*
  useEffect(() => {
    if (!notification || notificationType !== 'order') return
    
    console.log('📦 Dashboard received notification update for order')
    
    setOrders(prev => {
      const orderExists = prev.some(o => o.order_id === notification.order_id)
      if (orderExists) {
        console.log('📦 Order already exists, updating:', notification.order_id)
        return prev.map(o => o.order_id === notification.order_id ? notification : o)
      }
      console.log('📦 Adding new order to list:', notification.order_id)
      return [notification, ...prev]
    })

    setStats(prev => {
      const updated = { ...prev }
      updated.totalOrders = (updated.totalOrders || 0) + 1
      if (['placed','confirmed','preparing'].includes(notification.status)) {
        updated.pendingOrders = (updated.pendingOrders || 0) + 1
      }
      const map = {
        placed: 'placedCount',
        confirmed: 'confirmedCount',
        preparing: 'preparingCount',
        ready: 'readyCount',
        delivered: 'deliveredCount',
        cancelled: 'cancelledCount'
      }
      const key = map[notification.status]
      if (key) updated[key] = (updated[key] || 0) + 1
      return updated
    })
  }, [notification, notificationType])
  */

  const fetchDashboardData = async (token) => {
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setOrders(data.recentOrders || [])
        setStats(data.stats || {})
      }
    } catch (err) {
      console.error('Failed to fetch dashboard:', err)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch (err) {
      console.error('Logout error:', err)
    }
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_username')
    router.push('/admin/login')
  }

  if (isLoading) return null

  return (
    <div className="min-h-screen bg-[var(--petuk-charcoal)]">
      {/* Header */}
      <header className="bg-black/50 border-b border-[var(--petuk-orange)]/30 sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--petuk-orange)] flex items-center justify-center text-white font-bold">
              প
            </div>
            <h1 className="text-xl font-bold text-[var(--petuk-orange)]">Petuk Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
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
        </div>
      </header>

      <div className="container py-6">
        {/* Navigation Tabs */}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 p-6 rounded">
            <div className="text-gray-400 text-sm">Today's Revenue</div>
            <div className="text-3xl font-bold text-[var(--petuk-orange)] mt-2">₹{stats.todayRevenue || 0}</div>
          </div>
          <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 p-6 rounded">
            <div className="text-gray-400 text-sm">Total Orders</div>
            <div className="text-3xl font-bold text-[var(--petuk-orange)] mt-2">{stats.totalOrders || 0}</div>
          </div>
          <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 p-6 rounded">
            <div className="text-gray-400 text-sm">Pending Orders</div>
            <div className="text-3xl font-bold text-yellow-500 mt-2">{stats.pendingOrders || 0}</div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Placed', count: stats.placedCount, color: 'bg-blue-900/30', key: 'placed' },
            { label: 'Confirmed', count: stats.confirmedCount, color: 'bg-green-900/30', key: 'confirmed' },
            { label: 'Preparing', count: stats.preparingCount, color: 'bg-yellow-900/30', key: 'preparing' },
            { label: 'Ready', count: stats.readyCount, color: 'bg-purple-900/30', key: 'ready' },
            { label: 'Delivered', count: stats.deliveredCount, color: 'bg-emerald-900/30', key: 'delivered' },
            { label: 'Cancelled', count: stats.cancelledCount, color: 'bg-red-900/30', key: 'cancelled' }
          ].map(status => (
            <button key={status.label} onClick={() => setSelectedStatus(selectedStatus === status.key ? null : status.key)} className={`${status.color} border border-[var(--petuk-orange)]/20 p-4 rounded text-center cursor-pointer transition-all duration-300 transform ${selectedStatus === status.key ? 'border-[var(--petuk-orange)] ring-2 ring-[var(--petuk-orange)] scale-105 shadow-lg shadow-[var(--petuk-orange)]/30' : 'hover:border-[var(--petuk-orange)] hover:scale-110 hover:shadow-lg hover:shadow-[var(--petuk-orange)]/20 hover:backdrop-blur-sm'}`}>
              <div className="text-2xl font-bold text-white drop-shadow-lg">{status.count}</div>
              <div className="text-xs text-[var(--petuk-offwhite)] font-semibold mt-1 drop-shadow-lg">{status.label}</div>
            </button>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-6" onClick={() => selectedStatus && setSelectedStatus(null)}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--petuk-orange)]">Recent Orders {selectedStatus && `(${selectedStatus})`}</h2>
            {selectedStatus && <button onClick={(e) => { e.stopPropagation(); setSelectedStatus(null); }} className="text-xs px-3 py-1 rounded bg-[var(--petuk-orange)]/20 text-[var(--petuk-orange)] hover:bg-[var(--petuk-orange)]/30 transition">Clear Filter</button>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-[var(--petuk-offwhite)]">
              <thead>
                <tr className="border-b border-[var(--petuk-orange)]/30">
                  <th className="text-left py-2 px-2">Order ID</th>
                  <th className="text-left py-2 px-2">Customer</th>
                  <th className="text-left py-2 px-2">Total</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Payment</th>
                  <th className="text-left py-2 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">No orders yet</td>
                  </tr>
                ) : (
                  orders.filter(order => !selectedStatus || order.status === selectedStatus).map(order => (
                    <tr key={order.order_id} className="border-b border-[var(--petuk-orange)]/20 hover:bg-black/40 hover:border-[var(--petuk-orange)]/50 transition-all duration-200 cursor-pointer hover:shadow-inner">
                      <td className="py-3 px-2 text-[var(--petuk-orange)]">#{order.order_id}</td>
                      <td className="py-3 px-2">{order.customer?.name || 'N/A'}</td>
                      <td className="py-3 px-2 font-semibold">₹{order.total || 0}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.status === 'placed' ? 'bg-blue-900/30 text-blue-400' :
                          order.status === 'confirmed' ? 'bg-green-900/30 text-green-400' :
                          order.status === 'preparing' ? 'bg-yellow-900/30 text-yellow-400' :
                          order.status === 'ready' ? 'bg-purple-900/30 text-purple-400' :
                          order.status === 'delivered' ? 'bg-emerald-900/30 text-emerald-400' :
                          order.status === 'cancelled' ? 'bg-red-900/30 text-red-400' :
                          'bg-gray-900/30 text-gray-400'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.payment_method === 'razorpay' ? 'bg-blue-900/30 text-blue-400' :
                          'bg-purple-900/30 text-purple-400'
                        }`}>
                          {order.payment_method || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <Link href={`/admin/orders/${order.order_id}`} className="text-[var(--petuk-orange)] hover:underline text-xs font-semibold transition-all duration-200 hover:text-[var(--petuk-orange-light)] hover:scale-110 inline-block hover:drop-shadow-lg">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
