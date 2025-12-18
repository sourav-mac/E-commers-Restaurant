import Header from '../components/Header'
import Footer from '../components/Footer'
import HeartRating from '../components/HeartRating'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Reviews(){
  const router = useRouter()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    review: ''
  })

  // Fetch reviews on mount
  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/public/reviews')
      const data = await res.json()
      if (data.success) {
        setReviews(data.reviews || [])
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    setFormLoading(true)

    try {
      const res = await fetch('/api/reviews/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          rating: parseInt(formData.rating),
          review: formData.review
        })
      })

      const data = await res.json()

      if (res.ok) {
        setFormSuccess('Thank you! Your review has been submitted successfully. 🙏')
        setFormData({ name: '', rating: 5, review: '' })
        
        // Redirect to home page after 2 seconds
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        setFormError(data.error || 'Failed to submit review')
      }
    } catch (err) {
      setFormError('Failed to submit review. Please try again.')
      console.error('Error submitting review:', err)
    } finally {
      setFormLoading(false)
    }
  }

  const renderStars = (rating) => {
    return '⭐'.repeat(rating)
  }

  return (
    <div>
      <Header />
      <main className="container py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-[var(--petuk-orange)] mb-2">Customer Reviews</h1>
          <p className="text-gray-400 mb-8">We value your feedback! Share your experience with us.</p>

          {/* Reviews List */}
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-400 mb-8">
              No reviews yet. Be the first to share your experience!
            </div>
          ) : (
            <div className="space-y-4 mb-12">
              {reviews.map((r, i) => (
                <div key={i} className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded-lg p-6 hover:border-[var(--petuk-orange)]/60 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-bold text-[var(--petuk-offwhite)]">{r.name}</div>
                    <div className="text-xl">{renderStars(r.rating)}</div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{r.review}</p>
                </div>
              ))}
            </div>
          )}

          {/* Review Submission Form */}
          <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded-lg p-8">
            <h3 className="text-xl font-bold text-[var(--petuk-orange)] mb-6">Share Your Experience</h3>

            {formError && (
              <div className="bg-red-900/30 border border-red-500/50 rounded p-4 mb-4 text-red-400 text-sm">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="bg-green-900/30 border border-green-500/50 rounded p-4 mb-4 text-green-400 text-sm">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] placeholder-gray-500 focus:border-[var(--petuk-orange)] outline-none transition"
                  required
                />
              </div>

              {/* Rating Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-4">Rating</label>
                <div className="flex justify-center mb-2">
                  <HeartRating 
                    rating={formData.rating} 
                    onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">Rate with hearts: {formData.rating} out of 5</p>
              </div>

              {/* Review Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Your Review</label>
                <textarea
                  name="review"
                  value={formData.review}
                  onChange={handleInputChange}
                  placeholder="Share your thoughts about our food and service..."
                  rows="5"
                  className="w-full px-4 py-2 bg-black/30 border border-[var(--petuk-orange)]/30 rounded text-[var(--petuk-offwhite)] placeholder-gray-500 focus:border-[var(--petuk-orange)] outline-none transition resize-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{formData.review.length}/500</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={formLoading}
                className="btn-uiverse w-full py-3"
              >
                {formLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
