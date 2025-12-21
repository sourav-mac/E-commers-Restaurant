'use client'

import { useState } from 'react'

export default function CancelReservationModal({ isOpen, reservation, onConfirm, onCancel, isLoading }) {
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

  const canCancelReservation = () => {
    if (!reservation) return false
    // Can only cancel if reservation is "pending" or "accepted"
    const cancellableStatuses = ['pending', 'accepted']
    return cancellableStatuses.includes(reservation.status)
  }

  if (!isOpen || !reservation) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/50 rounded-lg p-6 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[var(--petuk-orange)] mb-2">Cancel Reservation?</h2>
          <p className="text-sm text-gray-400">Reservation ID: <span className="text-[var(--petuk-orange)]">#{reservation.id}</span></p>
        </div>

        {/* Warning */}
        <div className="bg-red-900/30 border border-red-500/50 rounded p-3 mb-4">
          <p className="text-sm text-red-400">
            ⚠️ Cancelling this reservation cannot be undone. The admin will be notified immediately.
          </p>
        </div>

        {/* Reservation Details */}
        <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/20 rounded p-3 mb-4">
          <div className="text-sm space-y-1">
            <div><span className="text-gray-400">Date:</span> <span className="text-[var(--petuk-offwhite)] font-semibold">{reservation.date}</span></div>
            <div><span className="text-gray-400">Time:</span> <span className="text-[var(--petuk-offwhite)] font-semibold">{reservation.time}</span></div>
            <div><span className="text-gray-400">Party Size:</span> <span className="text-[var(--petuk-offwhite)] font-semibold">{reservation.size} {parseInt(reservation.size) === 1 ? 'person' : 'people'}</span></div>
          </div>
        </div>

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
            <option value="date_conflict">Date/time conflict</option>
            <option value="other_plans">Made other plans</option>
            <option value="unavailable">No longer available</option>
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

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded font-semibold transition bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            No, Keep Reservation
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded font-semibold transition bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Cancelling...' : 'Yes, Cancel Reservation'}
          </button>
        </div>
      </div>
    </div>
  )
}
