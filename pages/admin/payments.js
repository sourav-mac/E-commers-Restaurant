'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function AdminPayments() {
  const router = useRouter()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) router.push('/admin/login')
    else fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/payments', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) setPayments(data.payments || [])
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch payments:', err)
      setLoading(false)
    }
  }

  const filteredPayments = filterStatus === 'all' 
    ? payments 
    : payments.filter(p => p.status === filterStatus)

  const totalRevenue = payments.reduce((sum, p) => p.status === 'captured' ? sum + p.amount : sum, 0)
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)

  if (loading) return <div className="flex items-center justify-center min-h-screen text-[var(--petuk-orange)]">Loading...</div>

  return (
    <div className="min-h-screen bg-[var(--petuk-charcoal)]">
      {/* Header */}
      <header className="bg-black/50 border-b border-[var(--petuk-orange)]/30 sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-xl font-bold text-[var(--petuk-orange)]">Payment Management</h1>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-4">
            <div className="text-xs text-gray-400 mb-2">Total Revenue</div>
            <div className="text-2xl font-bold text-[var(--petuk-orange)]">₹{totalRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-4">
            <div className="text-xs text-gray-400 mb-2">Pending Amount</div>
            <div className="text-2xl font-bold text-orange-400">₹{totalPending.toLocaleString()}</div>
          </div>
          <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-4">
            <div className="text-xs text-gray-400 mb-2">Total Transactions</div>
            <div className="text-2xl font-bold text-[var(--petuk-offwhite)]">{payments.length}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] focus:border-[var(--petuk-orange)] outline-none"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="captured">Captured</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Payments Table */}
        <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--petuk-orange)]/20 bg-black/30">
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold">Order ID</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold">Method</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold">Order Status</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold">Payment Status</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold">Payment ID</th>
                  <th className="px-4 py-3 text-left text-gray-400 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment, i) => (
                    <tr key={i} className="border-b border-[var(--petuk-orange)]/10 hover:bg-black/20">
                      <td className="px-4 py-3 text-[var(--petuk-orange)]">#{payment.order_id?.slice(-6)}</td>
                      <td className="px-4 py-3 text-[var(--petuk-offwhite)]">{payment.customer_name}</td>
                      <td className="px-4 py-3 text-lg font-bold text-[var(--petuk-orange)]">₹{payment.amount}</td>
                      <td className="px-4 py-3 text-gray-400">{payment.method === 'razorpay' ? '💳 Razorpay' : '💵 COD'}</td>
                      <td className="px-4 py-3 capitalize text-gray-400 text-sm">{payment.order_status}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          payment.status === 'captured' ? 'bg-green-900/30 text-green-400' :
                          payment.status === 'pending' ? 'bg-orange-900/30 text-orange-400' :
                          'bg-red-900/30 text-red-400'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">{payment.payment_id || '-'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(payment.created_at).toLocaleDateString()}
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
