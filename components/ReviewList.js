import Link from 'next/link'

export default function ReviewList({reviews}){
  const renderHearts = (rating) => {
    const heartColors = ['#ff0000', '#ff6600', '#ffcc00', '#00cc00', '#9900ff']
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {Array.from({ length: rating }).map((_, i) => (
          <span key={i} style={{ color: heartColors[i] || '#666', fontSize: '20px' }}>
            ❤️
          </span>
        ))}
      </div>
    )
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="card text-center py-8 text-gray-400">
        <p>No reviews yet. Be the first to share your experience!</p>
        <Link href="/reviews" className="inline-block text-[var(--petuk-orange)] hover:text-[var(--petuk-orange-light)] font-semibold mt-4">
          Write a review →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.slice(0, 3).map((r, idx) => (
        <div key={idx} className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded-lg p-4 hover:border-[var(--petuk-orange)]/60 transition">
          <div className="flex justify-between items-start mb-2">
            <div className="font-bold text-[var(--petuk-offwhite)]">{r.name}</div>
            {renderHearts(r.rating)}
          </div>
          <div className="text-sm text-gray-300 italic">"{r.review}"</div>
        </div>
      ))}
      <Link href="/reviews" className="inline-block text-[var(--petuk-orange)] hover:text-[var(--petuk-orange-light)] font-semibold mt-4">
        Read all reviews & write yours →
      </Link>
    </div>
  )
}
