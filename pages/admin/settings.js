'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function AdminSettings() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [credentialMessage, setCredentialMessage] = useState(null)
  const [credentialError, setCredentialError] = useState(null)
  const [credentialLoading, setCredentialLoading] = useState(false)
  const [credentials, setCredentials] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: ''
  })
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
    const token = localStorage.getItem('admin_token')
    if (!token) router.push('/admin/login')
    else fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('admin_token')
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
      const token = localStorage.getItem('admin_token')
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

  const handleChangeCredentials = async (e) => {
    e.preventDefault()
    setCredentialError(null)
    setCredentialMessage(null)
    setCredentialLoading(true)

    try {
      const token = localStorage.getItem('admin_token')
      
      // Check if at least one field is being changed
      if (!credentials.newUsername && !credentials.newPassword) {
        setCredentialError('Please enter new username or password to change')
        setCredentialLoading(false)
        return
      }

      const res = await fetch('/api/admin/change-credentials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: credentials.currentPassword,
          newUsername: credentials.newUsername || null,
          newPassword: credentials.newPassword || null,
          confirmPassword: credentials.confirmPassword || null
        })
      })

      const data = await res.json()

      if (res.ok) {
        setCredentialMessage('✅ Credentials updated successfully!')
        setCredentials({
          currentPassword: '',
          newUsername: '',
          newPassword: '',
          confirmPassword: ''
        })
        setTimeout(() => setCredentialMessage(null), 5000)
      } else {
        setCredentialError(data.error || 'Failed to update credentials')
      }
    } catch (err) {
      console.error('Failed to change credentials:', err)
      setCredentialError('Connection error. Please try again.')
    }
    setCredentialLoading(false)
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

        {/* SECURITY: Change Admin Credentials */}
        <form onSubmit={handleChangeCredentials} className="mt-12 flex justify-center">
          <div className="relative w-full max-w-sm p-8 bg-[var(--petuk-charcoal)] rounded-lg shadow-lg overflow-hidden">
            {/* Decorative Element */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[var(--petuk-orange-light)] to-[var(--petuk-orange)] rounded-full transform translate-x-16 -translate-y-16 opacity-20"></div>

            {/* Header */}
            <div className="relative z-10 mb-8">
              <h2 className="text-3xl font-bold text-[var(--petuk-offwhite)] mb-1">Admin Security</h2>
              <p className="text-sm text-gray-400">Change your credentials securely</p>
            </div>

            {/* Current Password (Required) */}
            <div className="relative z-10 mb-6">
              <div className="flex items-center relative">
                <svg className="absolute left-3 w-5 h-5 text-[var(--petuk-orange)]" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                </svg>
                <input
                  type="password"
                  value={credentials.currentPassword}
                  onChange={(e) => setCredentials({ ...credentials, currentPassword: e.target.value })}
                  placeholder="Current password"
                  required
                  className="w-full h-10 pl-10 pr-4 bg-transparent border-b-2 border-gray-600 text-[var(--petuk-offwhite)] placeholder-gray-500 focus:outline-none focus:border-[var(--petuk-orange)] transition-colors text-sm font-medium"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 pl-8">Required to verify your identity</p>
            </div>

            {/* New Username */}
            <div className="relative z-10 mb-6">
              <div className="flex items-center relative">
                <svg className="absolute left-3 w-5 h-5 text-[var(--petuk-orange)]" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"/>
                </svg>
                <input
                  type="text"
                  value={credentials.newUsername}
                  onChange={(e) => setCredentials({ ...credentials, newUsername: e.target.value })}
                  placeholder="New username"
                  minLength="3"
                  className="w-full h-10 pl-10 pr-4 bg-transparent border-b-2 border-gray-600 text-[var(--petuk-offwhite)] placeholder-gray-500 focus:outline-none focus:border-[var(--petuk-orange)] transition-colors text-sm font-medium"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 pl-8">Min 3 characters • Leave blank to keep current</p>
            </div>

            {/* New Password */}
            <div className="relative z-10 mb-6">
              <div className="flex items-center relative">
                <svg className="absolute left-3 w-5 h-5 text-[var(--petuk-orange)]" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                </svg>
                <input
                  type="password"
                  value={credentials.newPassword}
                  onChange={(e) => setCredentials({ ...credentials, newPassword: e.target.value })}
                  placeholder="New password"
                  minLength="12"
                  className="w-full h-10 pl-10 pr-4 bg-transparent border-b-2 border-gray-600 text-[var(--petuk-offwhite)] placeholder-gray-500 focus:outline-none focus:border-[var(--petuk-orange)] transition-colors text-sm font-medium"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 pl-8">Min 12 chars • Must include uppercase, lowercase, number & symbol</p>
            </div>

            {/* Confirm Password */}
            {credentials.newPassword && (
              <div className="relative z-10 mb-6">
                <div className="flex items-center relative">
                  <svg className="absolute left-3 w-5 h-5 text-[var(--petuk-orange)]" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                  </svg>
                  <input
                    type="password"
                    value={credentials.confirmPassword}
                    onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full h-10 pl-10 pr-4 bg-transparent border-b-2 border-gray-600 text-[var(--petuk-offwhite)] placeholder-gray-500 focus:outline-none focus:border-[var(--petuk-orange)] transition-colors text-sm font-medium"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {credentialError && (
              <div className="relative z-10 mb-4 p-3 bg-red-900/30 border border-[var(--petuk-orange)] text-red-300 rounded text-sm font-medium">
                {credentialError}
              </div>
            )}

            {/* Success Message */}
            {credentialMessage && (
              <div className="relative z-10 mb-4 p-3 bg-green-900/30 border border-green-700 text-green-300 rounded text-sm font-medium">
                ✓ {credentialMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={credentialLoading}
              className="relative z-10 w-full mt-8 py-2.5 bg-[var(--petuk-orange)] text-white font-semibold rounded text-sm transition-all hover:bg-[var(--petuk-orange-light)] hover:shadow-lg hover:shadow-[var(--petuk-orange)]/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {credentialLoading ? 'Updating...' : 'Update Credentials'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
