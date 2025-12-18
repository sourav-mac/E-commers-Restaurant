import { useEffect, useState } from 'react'
import OpenStatus from './OpenStatus'

export default function Hero(){
  const [openingTime, setOpeningTime] = useState('11:00')
  const [closingTime, setClosingTime] = useState('22:00')
  const [reviewCount, setReviewCount] = useState(0)
  const [rating, setRating] = useState(4.3)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch settings for opening/closing times
        const settingsRes = await fetch('/api/public/settings?t=' + Date.now())
        const settingsData = await settingsRes.json()
        if (settingsData.success && settingsData.settings) {
          if (settingsData.settings.opening_time) setOpeningTime(settingsData.settings.opening_time)
          if (settingsData.settings.closing_time) setClosingTime(settingsData.settings.closing_time)
        }

        // Fetch reviews for count and rating
        const reviewsRes = await fetch('/api/public/reviews?t=' + Date.now())
        const reviewsData = await reviewsRes.json()
        if (reviewsData.success && reviewsData.reviews) {
          setReviewCount(reviewsData.reviews.length)
          
          // Calculate average rating
          if (reviewsData.reviews.length > 0) {
            const avgRating = (reviewsData.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsData.reviews.length).toFixed(1)
            setRating(avgRating)
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
      }
    }
    fetchData()
    // Refetch data every 1 minute to get latest changes
    const interval = setInterval(fetchData, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="card mt-6 overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          <img src="/images/petuk-hero.png" alt="Petuk hero" className="w-full h-full object-contain rounded" />
        </div>
        <div className="md:w-1/2 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-[var(--petuk-orange)]">Petuk (পেটুক)</h1>
          <p className="text-sm text-gray-400 mt-1">Authentic local flavours from Gangasagar</p>
          <p className="mt-3 text-[var(--petuk-offwhite)]">Cozy dine-in, quick drive-through, and reliable delivery. ₹200–₹400 per person.</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href="tel:09647497019" className="btn-uiverse">Call Now / কল করুন</a>
            <a href="/menu" className="btn-uiverse">Order Online</a>
            <a href="/reserve" className="btn-uiverse-outline">Reserve Table</a>
          </div>

          <div className="mt-6 flex items-center gap-4 flex-wrap">
            <div className="text-[var(--petuk-orange)] font-bold text-lg">★ {rating}</div>
            <div className="text-sm text-gray-400">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</div>
            <OpenStatus opensAt={openingTime} closesAt={closingTime} />
          </div>
        </div>
      </div>
    </section>
  )
}
