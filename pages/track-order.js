'use client'

import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function TrackOrder() {
  const [orderID, setOrderID] = useState('')
  const [phone, setPhone] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const res = await fetch(`/api/orders/${orderID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })

      const data = await res.json()
      if (res.ok && data.order) {
        // Verify phone matches
        if (data.order.customer?.phone === phone) {
          setOrder(data.order)
        } else {
          setError('Phone number does not match this order')
        }
      } else {
        setError(data.error || 'Order not found')
      }
    } catch (err) {
      setError('Failed to fetch order details')
      console.error(err)
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

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'placed':
        return '📝'
      case 'confirmed':
        return '✅'
      case 'preparing':
        return '👨‍🍳'
      case 'ready':
        return '📦'
      case 'delivered':
        return '🚚'
      case 'cancelled':
        return '❌'
      default:
        return '❓'
    }
  }

  const statusSteps = ['placed', 'confirmed', 'preparing', 'ready', 'delivered']

  return (
    <div>
      <Header />
      <main className="container py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-[var(--petuk-orange)] mb-2 text-center">Track Your Order</h1>
          <p className="text-gray-400 text-center mb-8">Enter your Order ID and Phone Number to check status</p>

          {/* Search Form */}
          <form onSubmit={handleTrack} className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Order ID</label>
                <input
                  type="text"
                  placeholder="e.g., PETUK-20251215-a1b2c3d4"
                  value={orderID}
                  onChange={(e) => setOrderID(e.target.value)}
                  className="w-full px-4 py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] focus:border-[var(--petuk-orange)] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] focus:border-[var(--petuk-orange)] outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-uiverse w-full py-2 disabled:opacity-50"
              >
                {loading ? 'Tracking...' : 'Track Order'}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded p-4 mb-6 text-red-400">
              {error}
            </div>
          )}

          {/* Order Details */}
          {order && (
            <div className="space-y-6">
              {/* Status Overview */}
              <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-6">
                <h2 className="text-xl font-bold text-[var(--petuk-orange)] mb-4">Order Status</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Current Status</p>
                    <div className={`text-2xl font-bold mt-2 px-4 py-2 rounded w-fit ${getStatusColor(order.status)}`}>
                      {getStatusEmoji(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>
                  {order.status === 'cancelled' && (
                    <div className="text-right">
                      <p className="text-red-400 text-sm font-semibold">This order was cancelled</p>
                    </div>
                  )}
                  {order.status === 'delivered' && (
                    <div className="text-right">
                      <p className="text-green-400 text-sm font-semibold">✓ Order Delivered</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Timeline */}
              {order.status !== 'cancelled' && (
                <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-6">
                  <h3 className="text-lg font-bold text-[var(--petuk-orange)] mb-4">Status Timeline</h3>
                  <div className="space-y-3">
                    {statusSteps.map((step, index) => {
                      const isCompleted = statusSteps.indexOf(order.status) >= index || order.status === 'cancelled'
                      const isCurrent = order.status === step
                      return (
                        <div key={step} className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            isCompleted
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-600/30 text-gray-400'
                          }`}>
                            {isCompleted ? '✓' : index + 1}
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold ${isCompleted ? 'text-green-400' : 'text-gray-400'}`}>
                              {step.charAt(0).toUpperCase() + step.slice(1)}
                            </p>
                            {step === 'placed' && <p className="text-xs text-gray-500">Order received</p>}
                            {step === 'confirmed' && <p className="text-xs text-gray-500">Admin confirmed your order</p>}
                            {step === 'preparing' && <p className="text-xs text-gray-500">Kitchen is preparing your order</p>}
                            {step === 'ready' && <p className="text-xs text-gray-500">Your order is ready for delivery</p>}
                            {step === 'delivered' && <p className="text-xs text-gray-500">Order delivered to you</p>}
                          </div>
                          {isCurrent && <span className="text-[var(--petuk-orange)] font-bold">← Current</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Order Details */}
              <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-6">
                <h3 className="text-lg font-bold text-[var(--petuk-orange)] mb-4">Order Details</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order ID:</span>
                    <span className="text-[var(--petuk-offwhite)] font-semibold">{order.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Customer:</span>
                    <span className="text-[var(--petuk-offwhite)]">{order.customer?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phone:</span>
                    <span className="text-[var(--petuk-offwhite)]">{order.customer?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Delivery Address:</span>
                    <span className="text-[var(--petuk-offwhite)] text-right">{order.address}</span>
                  </div>
                  {order.instructions && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Instructions:</span>
                      <span className="text-[var(--petuk-offwhite)] text-right">{order.instructions}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Method:</span>
                    <span className="text-[var(--petuk-offwhite)]">{order.payment_method === 'razorpay' ? '💳 Online' : '💵 Cash on Delivery'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order Time:</span>
                    <span className="text-[var(--petuk-offwhite)]">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-[var(--petuk-orange)]/20 pt-4">
                  <h4 className="font-bold text-[var(--petuk-orange)] mb-3">Items</h4>
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between mb-2 text-sm">
                      <span className="text-gray-400">{item.name} × {item.qty}</span>
                      <span className="text-[var(--petuk-offwhite)]">₹{item.itemTotal}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded p-6">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal:</span>
                    <span>₹{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Tax (5%):</span>
                    <span>₹{order.tax}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Delivery Fee:</span>
                    <span>₹{order.delivery_fee}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount:</span>
                      <span>-₹{order.discount}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-[var(--petuk-orange)]/20 pt-4 flex justify-between">
                  <span className="text-lg font-bold text-gray-400">Total Amount:</span>
                  <span className="text-2xl font-bold text-[var(--petuk-orange)]">₹{order.total}</span>
                </div>
              </div>
            </div>
          )}

          {!order && !error && !loading && (
            <div className="text-center text-gray-400 py-8">
              <p className="text-lg">📦 Enter your order details above to track your order</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
