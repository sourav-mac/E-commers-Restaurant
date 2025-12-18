'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function AdminAnalytics() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('today')

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) router.push('/admin/login')
    else fetchAnalytics()
  }, [timeframe])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/analytics?timeframe=${timeframe}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) setAnalytics(data.analytics)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen text-[var(--petuk-orange)]">Loading...</div>

  if (!analytics) return <div className="flex items-center justify-center min-h-screen text-[var(--petuk-orange)]">No data available</div>

  return (
    <div className="min-h-screen bg-[var(--petuk-charcoal)]">
      {/* Header */}
      <header className="bg-black/50 border-b border-[var(--petuk-orange)]/30 sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-xl font-bold text-[var(--petuk-orange)]">Analytics & Reports</h1>
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

        {/* Timeframe Filter */}
        <div className="mb-6 flex gap-2">
          {['today', 'week', 'month', 'year'].map(tf => (
            <button
              key={tf}
              onClick={() => {
                setTimeframe(tf)
                setLoading(true)
              }}
              className={`px-4 py-2 rounded font-semibold transition text-sm ${
                timeframe === tf
                  ? 'bg-[var(--petuk-orange)] text-white'
                  : 'bg-black/30 border border-[var(--petuk-orange)]/30 text-[var(--petuk-offwhite)] hover:border-[var(--petuk-orange)]'
              }`}
            >
              {tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-4">
            <div className="text-xs text-gray-400 mb-2">Total Orders</div>
            <div className="text-2xl font-bold text-[var(--petuk-orange)]">{analytics.total_orders}</div>
          </div>
          <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-4">
            <div className="text-xs text-gray-400 mb-2">Total Revenue</div>
            <div className="text-2xl font-bold text-[var(--petuk-orange)]">₹{analytics.total_revenue.toLocaleString()}</div>
          </div>
          <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-4">
            <div className="text-xs text-gray-400 mb-2">Avg Order Value</div>
            <div className="text-2xl font-bold text-[var(--petuk-orange)]">₹{analytics.avg_order_value}</div>
          </div>
          <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-4">
            <div className="text-xs text-gray-400 mb-2">Conversion Rate</div>
            <div className="text-2xl font-bold text-[var(--petuk-orange)]">{analytics.conversion_rate}%</div>
          </div>
        </div>

        {/* Payment Method Split */}
        <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-6 mb-6">
          <h2 className="text-lg font-bold text-[var(--petuk-orange)] mb-4">Payment Method Split</h2>
          <div className="space-y-3">
            {Object.entries(analytics.payment_methods || {}).map(([method, amount]) => (
              <div key={method}>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400 capitalize">{method}</span>
                  <span className="text-[var(--petuk-orange)] font-bold">₹{amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-black/30 rounded h-2">
                  <div
                    className="bg-[var(--petuk-orange)] h-2 rounded"
                    style={{ width: `${(amount / analytics.total_revenue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Items */}
        <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-6 mb-6">
          <h2 className="text-lg font-bold text-[var(--petuk-orange)] mb-4">Top Selling Items</h2>
          <div className="space-y-2">
            {analytics.top_items?.map((item, i) => (
              <div key={i} className="flex justify-between items-center pb-2 border-b border-[var(--petuk-orange)]/10 last:border-b-0">
                <div className="flex items-center gap-3">
                  <span className="text-[var(--petuk-orange)] font-bold text-sm">#{i + 1}</span>
                  <span className="text-[var(--petuk-offwhite)]">{item.name}</span>
                </div>
                <span className="text-gray-400 text-sm">{item.quantity} sold</span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-6">
          <h2 className="text-lg font-bold text-[var(--petuk-orange)] mb-4">Peak Hours</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics.peak_hours?.map((hour, i) => (
              <div key={i} className="bg-black/30 p-4 rounded border border-[var(--petuk-orange)]/20">
                <div className="text-sm text-gray-400">{hour.time}</div>
                <div className="text-2xl font-bold text-[var(--petuk-orange)]">{hour.orders}</div>
                <div className="text-xs text-gray-500 mt-1">Orders</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
