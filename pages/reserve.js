import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useLoading } from '../context/LoadingContext'

export default function Reserve(){
  const router = useRouter()
  const { showLoading, hideLoading, resetLoading } = useLoading()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [reservation, setReservation] = useState(null)

  // Reset loader state when reservation page loads or is revisited
  useEffect(() => {
    // Only reset when page is ready and pathname is /reserve
    if (router.isReady && router.pathname === '/reserve') {
      resetLoading() // Clear any stuck state
      hideLoading() // Ensure loader is hidden on page load
    }
  }, [router.isReady, router.pathname, resetLoading, hideLoading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    showLoading('Booking your reservation...')
    setError('')

    const formData = new FormData(e.target)
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      date: formData.get('date'),
      time: formData.get('time'),
      size: formData.get('size'),
      note: formData.get('note')
    }

    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (result.success) {
        setSuccess(true)
        setReservation(result.reservation)
        e.target.reset()
        setTimeout(() => {
          hideLoading()
        }, 500)
        setTimeout(() => {
          window.location.href = '/'
        }, 3000)
      } else {
        setError(result.message || 'Failed to book reservation')
        setTimeout(() => {
          hideLoading()
        }, 300)
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error booking reservation. Please try again.')
      setTimeout(() => {
        hideLoading()
      }, 300)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Header />
      <main className="container py-6 md:py-8">
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--petuk-orange)]">Reserve a Table</h1>
            <p className="text-sm md:text-base text-gray-400 mt-2">Fill the form and we will call to confirm your reservation.</p>

            <div className="mt-4 md:mt-6 card">
          {success ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <h2 className="font-bold">✅ Reservation Confirmed!</h2>
              <p className="mt-2">
                <strong>Reservation ID:</strong> {reservation?.id}
              </p>
              <p>
                <strong>Name:</strong> {reservation?.name}
              </p>
              <p>
                <strong>Date:</strong> {reservation?.date} at {reservation?.time}
              </p>
              <p>
                <strong>Party Size:</strong> {reservation?.size}
              </p>
              <p className="mt-3 text-sm">
                We will call {reservation?.originalPhone} to confirm. Redirecting to home page in 3 seconds...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-600/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}
              
              <label className="block mt-4 md:mt-3">
                <span className="block font-semibold text-sm md:text-base mb-2">Name *</span>
                <input 
                  name="name" 
                  required 
                  className="w-full border rounded p-3 md:p-2 text-sm md:text-base"
                  disabled={loading}
                />
              </label>

              <label className="block mt-4 md:mt-3">
                <span className="block font-semibold text-sm md:text-base mb-2">Phone *</span>
                <input 
                  name="phone" 
                  type="tel"
                  required 
                  placeholder="10-digit number"
                  className="w-full border rounded p-3 md:p-2 text-sm md:text-base"
                  disabled={loading}
                />
              </label>

              <label className="block mt-4 md:mt-3">
                <span className="block font-semibold text-sm md:text-base mb-2">Date *</span>
                <input 
                  name="date" 
                  type="date" 
                  required 
                  className="w-full border rounded p-3 md:p-2 text-sm md:text-base"
                  disabled={loading}
                />
              </label>

              <label className="block mt-4 md:mt-3">
                <span className="block font-semibold text-sm md:text-base mb-2">Time *</span>
                <input 
                  name="time" 
                  type="time" 
                  required 
                  className="w-full border rounded p-3 md:p-2 text-sm md:text-base"
                  disabled={loading}
                />
              </label>

              <label className="block mt-4 md:mt-3">
                <span className="block font-semibold text-sm md:text-base mb-2">Party Size *</span>
                <select 
                  name="size" 
                  className="w-full border rounded p-3 md:p-2 text-sm md:text-base"
                  disabled={loading}
                >
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5+</option>
                </select>
              </label>

              <label className="block mt-4 md:mt-3">
                <span className="block font-semibold text-sm md:text-base mb-2">Special Requests</span>
                <textarea 
                  name="note" 
                  className="w-full border rounded p-3 md:p-2 text-sm md:text-base"
                  placeholder="Any special requests? (Optional)"
                  disabled={loading}
                  rows="4"
                />
              </label>

              <div className="mt-6 md:mt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-uiverse px-6 md:px-8 py-3 md:py-2 text-sm md:text-base disabled:opacity-50"
                >
                  {loading ? 'Booking...' : 'Request Reservation'}
                </button>
              </div>
            </form>
          )}
          
          <p className="mt-6 md:mt-8 text-xs md:text-sm text-gray-400 border-t border-[var(--petuk-orange)]/20 pt-4">
            💡 <strong>Walk-ins welcomed!</strong> If you prefer to walk in, we welcome you anytime after our opening hours.
          </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
