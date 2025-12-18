'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      // Save token to localStorage
      localStorage.setItem('adminToken', data.token)
      localStorage.setItem('adminRole', data.role)

      router.push('/admin/dashboard')
    } catch (err) {
      setError('Connection error: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--petuk-charcoal)] to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--petuk-orange)] to-[var(--petuk-orange-light)] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
              প
            </div>
            <h1 className="text-2xl font-bold text-[var(--petuk-orange)]">Petuk Admin</h1>
            <p className="text-sm text-gray-400 mt-2">Restaurant Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--petuk-offwhite)] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] focus:border-[var(--petuk-orange)] outline-none transition"
                placeholder="admin@petuk.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--petuk-offwhite)] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] focus:border-[var(--petuk-orange)] outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--petuk-orange)] hover:bg-[var(--petuk-orange-light)] text-white font-bold py-2 rounded transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--petuk-orange)]/20 text-center text-sm text-gray-400">
            <p>Demo credentials:</p>
            <p className="text-xs mt-2 text-gray-500">Email: admin@petuk.com</p>
            <p className="text-xs text-gray-500">Password: admin123</p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-[var(--petuk-orange)] hover:underline">
              Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
