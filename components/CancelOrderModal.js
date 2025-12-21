'use client'

import { useState } from 'react'

export default function CancelOrderModal({ isOpen, order, onConfirm, onCancel, isLoading }) {
  const [reason, setReason] = useState('changed_mind')
  const [customReason, setCustomReason] = useState('')

  const handleConfirm = () => {
    const finalReason = reason === 'other' ? customReason : reason
    if (!finalReason.trim()) {
      alert('Please provide a reason for cancellation')
      return
    }
    onConfirm(finalReason)
  }

  const canCancelOrder = () => {
    if (!order) return false
    // Can only cancel if order is in these statuses
    const cancellableStatuses = ['placed', 'confirmed', 'ready']
    return cancellableStatuses.includes(order.status)
  }

  if (!isOpen || !order) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/50 rounded-lg p-6 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[var(--petuk-orange)] mb-2">Cancel Order?</h2>
          <p className="text-sm text-gray-400">Order ID: <span className="text-[var(--petuk-orange)]">#{order.order_id}</span></p>
        </div>

        {/* Warning */}
        <div className="bg-red-900/30 border border-red-500/50 rounded p-3 mb-4">
          <p className="text-sm text-red-400">
            ⚠️ Cancelling this order cannot be undone. The admin will be notified immediately.
          </p>
        </div>

        {/* Refund Info */}
        {order.payment_method === 'razorpay' && (
          <div className="bg-blue-900/30 border border-blue-500/50 rounded p-3 mb-4">
            <p className="text-sm text-blue-400">
              💳 For online payments: Refund will be processed within 3-5 business days.
            </p>
          </div>
        )}

        {/* Reason Selection */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-400 mb-2">Reason for cancellation:</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] focus:border-[var(--petuk-orange)] outline-none disabled:opacity-50"
          >
            <option value="changed_mind">Changed my mind</option>
            <option value="delivery_time">Taking too long</option>
            <option value="other_place">Ordering from elsewhere</option>
            <option value="other">Other (please specify)</option>
          </select>
        </div>

        {/* Custom Reason */}
        {reason === 'other' && (
          <div className="mb-4">
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              disabled={isLoading}
              placeholder="Please tell us why..."
              className="w-full px-3 py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] focus:border-[var(--petuk-orange)] outline-none text-sm disabled:opacity-50"
              rows="3"
            />
          </div>
        )}

        {/* Amount Info */}
        <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/20 rounded p-3 mb-4">
          <div className="text-sm">
            <span className="text-gray-400">Order Amount: </span>
            <span className="text-[var(--petuk-orange)] font-bold">₹{order.total}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded font-semibold transition bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            No, Keep Order
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded font-semibold transition bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Cancelling...' : 'Yes, Cancel Order'}
          </button>
        </div>
      </div>
    </div>
  )
}
