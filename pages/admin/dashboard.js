'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useNotification } from '../../context/NotificationContext'

export default function AdminDashboard() {
  const router = useRouter()
  const { notification, notificationType } = useNotification()
  const [orders, setOrders] = useState([])
  const [todayOrders, setTodayOrders] = useState([])
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
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState(null)

  useEffect(() => {
    console.log('🎬 useEffect running - setting up admin dashboard')
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchDashboardData()
  }, [])

  // When notification changes, update orders list if it's an order
  useEffect(() => {
    if (!notification || notificationType !== 'order') return
    
    console.log('📦 Dashboard received notification update for order')
    setOrders(prev => [notification, ...prev])

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

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setOrders(data.recentOrders || [])
        setTodayOrders(data.todayOrders || [])
        setStats(data.stats || {})
      }
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch dashboard:', err)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminRole')
    router.push('/admin/login')
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="loader">
        <div className="truckWrapper">
          <div className="truckBody">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 198 93" className="trucksvg" style={{width: '200px'}}>
              <path strokeWidth="3" stroke="#282828" fill="#FF7A00" d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z"></path>
              <path strokeWidth="3" stroke="#282828" fill="#7D7C7C" d="M146 33.5H181.741C182.779 33.5 183.709 34.1415 184.078 35.112L190.538 52.112C191.16 53.748 189.951 55.5 188.201 55.5H146C144.619 55.5 143.5 54.3807 143.5 53V36C143.5 34.6193 144.619 33.5 146 33.5Z"></path>
              <path strokeWidth="2" stroke="#282828" fill="#282828" d="M150 65C150 65.39 149.763 65.8656 149.127 66.2893C148.499 66.7083 147.573 67 146.5 67C145.427 67 144.501 66.7083 143.873 66.2893C143.237 65.8656 143 65.39 143 65C143 64.61 143.237 64.1344 143.873 63.7107C144.501 63.2917 145.427 63 146.5 63C147.573 63 148.499 63.2917 149.127 63.7107C149.763 64.1344 150 64.61 150 65Z"></path>
              <rect strokeWidth="2" stroke="#282828" fill="#FFFCAB" rx="1" height="7" width="5" y="63" x="187"></rect>
              <rect strokeWidth="2" stroke="#282828" fill="#282828" rx="1" height="11" width="4" y="81" x="193"></rect>
              <rect strokeWidth="3" stroke="#282828" fill="#DFDFDF" rx="2.5" height="90" width="121" y="1.5" x="6.5"></rect>
              <rect strokeWidth="2" stroke="#282828" fill="#DFDFDF" rx="2" height="4" width="6" y="84" x="1"></rect>
            </svg>
          </div>
          <div className="truckTires">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" className="tiresvg">
              <circle strokeWidth="3" stroke="#282828" fill="#282828" r="13.5" cy="15" cx="15"></circle>
              <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" className="tiresvg">
              <circle strokeWidth="3" stroke="#282828" fill="#282828" r="13.5" cy="15" cx="15"></circle>
              <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
            </svg>
          </div>
          <div className="road"></div>
          <svg xmlSpace="preserve" viewBox="0 0 453.459 453.459" xmlns="http://www.w3.org/2000/svg" version="1.1" fill="#282828" className="lampPost">
            <path d="M252.882,0c-37.781,0-68.686,29.953-70.245,67.358h-6.917v8.954c-26.109,2.163-45.463,10.011-45.463,19.366h9.993c-1.65,5.146-2.507,10.54-2.507,16.017c0,28.956,23.558,52.514,52.514,52.514c28.956,0,52.514-23.558,52.514-52.514c0-5.478-0.856-10.872-2.506-16.017h9.992c0-9.354-19.352-17.204-45.463-19.366v-8.954h-6.149C200.189,38.779,223.924,16,252.882,16c29.952,0,54.32,24.368,54.32,54.32c0,28.774-11.078,37.009-25.105,47.437c-17.444,12.968-37.216,27.667-37.216,78.884v113.914h-0.797c-5.068,0-9.174,4.108-9.174,9.177c0,2.844,1.293,5.383,3.321,7.066c-3.432,27.933-26.851,95.744-8.226,115.459v11.202h45.75v-11.202c18.625-19.715-4.794-87.527-8.227-115.459c2.029-1.683,3.322-4.223,3.322-7.066c0-5.068-4.107-9.177-9.176-9.177h-0.795V196.641c0-43.174,14.942-54.283,30.762-66.043c14.793-10.997,31.559-23.461,31.559-60.277C323.202,31.545,291.656,0,252.882,0zM232.77,111.694c0,23.442-19.071,42.514-42.514,42.514c-23.442,0-42.514-19.072-42.514-42.514c0-5.531,1.078-10.957,3.141-16.017h78.747C231.693,100.736,232.77,106.162,232.77,111.694z"></path>
          </svg>
        </div>
      </div>
    </div>
  )

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
