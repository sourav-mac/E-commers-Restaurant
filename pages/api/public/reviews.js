// pages/api/public/reviews.js
import { readData } from '../../../lib/dataStore'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const data = readData('reviews') || { reviews: [] }
    
    // Sort reviews by newest first
    const sortedReviews = (data.reviews || []).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )

    res.status(200).json({
      success: true,
      reviews: sortedReviews,
      count: sortedReviews.length
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
}
