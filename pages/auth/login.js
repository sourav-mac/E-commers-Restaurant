/**
 * Secure OTP Login Page
 * Path: /auth/login
 * 
 * Flow:
 * 1. User enters phone number
 * 2. System sends OTP via SMS
 * 3. User enters OTP
 * 4. System verifies and issues JWT token
 * 5. User is logged in and redirected to orders
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function OTPLogin() {
  const router = useRouter()
  const [step, setStep] = useState('phone') // 'phone' or 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [otpMessage, setOtpMessage] = useState('')
  const [debugOtp, setDebugOtp] = useState(null) // For development

  // Step 1: Request OTP
  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Validate phone
      const normalizedPhone = phone.replace(/\D/g, '')
      if (normalizedPhone.length < 10) {
        setError('Please enter a valid 10-digit phone number')
        setLoading(false)
        return
      }

      // Send OTP request
      console.log('📱 [LOGIN] Requesting OTP for phone:', phone)
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP')
        setLoading(false)
        return
      }

      // Move to OTP verification step
      setSuccess('✅ ' + data.message)
      setOtpMessage(`OTP sent to +91${normalizedPhone.slice(-10)}. Please check your phone.`)
      
      // For development: show OTP in debug
      if (data.otp) {
        setDebugOtp(data.otp)
      }

      setStep('otp')
      setOtp('')
    } catch (err) {
      console.error('❌ OTP request error:', err)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (otp.length !== 6) {
        setError('OTP must be 6 digits')
        setLoading(false)
        return
      }

      // Verify OTP
      console.log('🔐 [LOGIN] Verifying OTP')
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'OTP verification failed')
        setLoading(false)
        return
      }

      // Save token and phone to localStorage
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user_phone', data.phone)

      setSuccess('✅ ' + data.message)
      console.log('✅ [LOGIN] Login successful')

      // Redirect to orders after short delay
      setTimeout(() => {
        router.push('/my-orders')
      }, 1500)
    } catch (err) {
      console.error('❌ OTP verification error:', err)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--petuk-charcoal)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[var(--petuk-orange)] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            প
          </div>
          <h1 className="text-2xl font-bold text-[var(--petuk-orange)] mb-2">Petuk Login</h1>
          <p className="text-gray-400 text-sm">Secure access to your orders</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-900/30 border border-green-500/50 text-green-400 p-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        {/* Step 1: Phone Entry */}
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--petuk-offwhite)] mb-2">
                📱 Enter Your Phone Number
              </label>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => {
                  // Only allow digits
                  const digits = e.target.value.replace(/\D/g, '')
                  setPhone(digits.slice(0, 10))
                }}
                className="w-full bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/50 rounded-lg px-4 py-3 text-[var(--petuk-offwhite)] placeholder-gray-600 focus:outline-none focus:border-[var(--petuk-orange)] transition"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                🔒 Your phone number is secure and only used for verification.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full bg-[var(--petuk-orange)] text-white font-semibold py-3 rounded-lg hover:bg-[var(--petuk-orange)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? '⏳ Sending OTP...' : '📤 Send OTP'}
            </button>

            {/* Debug Info - Development Only */}
            {process.env.NODE_ENV !== 'production' && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 rounded-lg text-xs text-yellow-600">
                <p className="font-semibold mb-1">🔧 Development Mode:</p>
                <p>Test phone: 9876543210</p>
                <p>OTP will be shown after sending</p>
              </div>
            )}
          </form>
        )}

        {/* Step 2: OTP Entry */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-4 text-center">
                {otpMessage}
              </p>

              <label className="block text-sm font-semibold text-[var(--petuk-offwhite)] mb-2">
                🔐 Enter OTP (6 digits)
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '')
                  setOtp(digits.slice(0, 6))
                }}
                className="w-full bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/50 rounded-lg px-4 py-3 text-[var(--petuk-offwhite)] placeholder-gray-600 focus:outline-none focus:border-[var(--petuk-orange)] transition text-center text-2xl letter-spacing-4 font-mono"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                ⏰ OTP valid for 10 minutes. You have 5 attempts.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-[var(--petuk-orange)] text-white font-semibold py-3 rounded-lg hover:bg-[var(--petuk-orange)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? '⏳ Verifying...' : '✅ Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('phone')
                setOtp('')
                setError('')
                setSuccess('')
                setDebugOtp(null)
              }}
              className="w-full bg-gray-700/50 text-gray-300 font-semibold py-2 rounded-lg hover:bg-gray-700 transition text-sm"
            >
              ← Back to Phone Entry
            </button>

            {/* Debug Info - Development Only */}
            {debugOtp && process.env.NODE_ENV !== 'production' && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 rounded-lg text-xs text-yellow-600">
                <p className="font-semibold mb-1">🔧 Development Mode:</p>
                <p>Your OTP is: <span className="font-mono font-bold">{debugOtp}</span></p>
                <p className="mt-1 text-yellow-500">⚠️ Never share OTP in production</p>
              </div>
            )}
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[var(--petuk-orange)]/20 text-center">
          <p className="text-xs text-gray-500 mb-4">
            🔒 This is a secure login. Your data is protected.
          </p>
          <Link href="/" className="text-[var(--petuk-orange)] hover:text-[var(--petuk-orange)]/80 text-sm font-semibold">
            ← Back to Home
          </Link>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
          <p className="text-xs text-blue-300">
            <span className="font-semibold">✓ How it works:</span>
            <br />1. Enter your phone number
            <br />2. Receive 6-digit OTP via SMS
            <br />3. Enter OTP to login
            <br />4. Access only your orders
          </p>
        </div>
      </div>
    </div>
  )
}
