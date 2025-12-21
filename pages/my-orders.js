/**
 * My Orders Page Redirect
 * 
 * This page now redirects to the secure authenticated version
 * Users must log in with OTP to view their orders
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function MyOrders() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to secure orders page
    router.replace('/secure-my-orders')
  }, [router])

  return (
    <div className="min-h-screen bg-[var(--petuk-charcoal)] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🔐</div>
        <p className="text-[var(--petuk-orange)] text-lg font-semibold">Redirecting to secure orders page...</p>
      </div>
    </div>
  )
}
