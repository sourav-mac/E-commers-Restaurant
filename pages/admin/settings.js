'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function AdminSettings() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    delivery_fee: 50,
    min_order_value: 0,
    tax_rate: 0,
    opening_time: '10:00',
    closing_time: '22:00',
    holidays: [],
    payment_methods: {
      cod: true,
      razorpay: true
    }
  })

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) router.push('/admin/login')
    else fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) setSettings(data.settings || settings)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch settings:', err)
      setLoading(false)
    }
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (res.ok) {
        alert('Settings updated successfully')
      }
    } catch (err) {
      console.error('Failed to save settings:', err)
      alert('Failed to save settings')
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen text-[var(--petuk-orange)]">Loading...</div>

  return (
    <div className="min-h-screen bg-[var(--petuk-charcoal)]">
      {/* Header */}
      <header className="bg-black/50 border-b border-[var(--petuk-orange)]/30 sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-xl font-bold text-[var(--petuk-orange)]">Business Settings</h1>
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

        <form onSubmit={handleSaveSettings} className="max-w-2xl">
          {/* Pricing Settings */}
          <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-6 mb-6">
            <h2 className="text-lg font-bold text-[var(--petuk-orange)] mb-4">💰 Pricing Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Delivery Fee (₹)</label>
                <input
                  type="number"
                  value={settings.delivery_fee}
                  onChange={(e) => setSettings({ ...settings, delivery_fee: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] focus:border-[var(--petuk-orange)] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Minimum Order Value (₹)</label>
                <input
                  type="number"
                  value={settings.min_order_value}
                  onChange={(e) => setSettings({ ...settings, min_order_value: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] focus:border-[var(--petuk-orange)] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.tax_rate}
                  onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] focus:border-[var(--petuk-orange)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-6 mb-6">
            <h2 className="text-lg font-bold text-[var(--petuk-orange)] mb-4">🕐 Operating Hours</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Opening Time</label>
                <input
                  type="time"
                  value={settings.opening_time}
                  onChange={(e) => setSettings({ ...settings, opening_time: e.target.value })}
                  className="w-full px-4 py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] focus:border-[var(--petuk-orange)] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Closing Time</label>
                <input
                  type="time"
                  value={settings.closing_time}
                  onChange={(e) => setSettings({ ...settings, closing_time: e.target.value })}
                  className="w-full px-4 py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] focus:border-[var(--petuk-orange)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-6 mb-6">
            <h2 className="text-lg font-bold text-[var(--petuk-orange)] mb-4">💳 Payment Methods</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-[var(--petuk-offwhite)]">
                <input
                  type="checkbox"
                  checked={settings.payment_methods.cod}
                  onChange={(e) => setSettings({
                    ...settings,
                    payment_methods: { ...settings.payment_methods, cod: e.target.checked }
                  })}
                  className="w-4 h-4"
                />
                <span>Cash on Delivery</span>
              </label>
              <label className="flex items-center gap-3 text-[var(--petuk-offwhite)]">
                <input
                  type="checkbox"
                  checked={settings.payment_methods.razorpay}
                  onChange={(e) => setSettings({
                    ...settings,
                    payment_methods: { ...settings.payment_methods, razorpay: e.target.checked }
                  })}
                  className="w-4 h-4"
                />
                <span>Razorpay (Credit/Debit Card)</span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="px-6 py-3 bg-[var(--petuk-orange)] text-white rounded font-bold hover:bg-[var(--petuk-orange)]/80 transition"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  )
}
