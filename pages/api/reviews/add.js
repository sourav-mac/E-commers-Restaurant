// pages/api/reviews/add.js
import { readData, writeData } from '../../../lib/dataStore'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, rating, review } = req.body

  // Validate inputs
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' })
  }

  if (!review || !review.trim()) {
    return res.status(400).json({ error: 'Review is required' })
  }

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' })
  }

  try {
    console.log('📝 Adding review:', { name, rating, reviewLength: review.length })
    
    const reviewsData = readData('reviews')
    console.log('Current reviews data:', reviewsData)
    
    // Handle both formats
    let reviews = reviewsData.reviews || reviewsData || { reviews: [] }
    
    // Create new review object
    const newReview = {
      name: name.trim(),
      rating: parseInt(rating),
      review: review.trim(),
      createdAt: new Date().toISOString()
    }

    console.log('New review object:', newReview)

    // Ensure reviews is an array
    if (!Array.isArray(reviews)) {
      reviews = []
    }

    // Add to reviews array
    reviews.push(newReview)

    // Write back to file
    const success = writeData('reviews', { reviews })
    
    if (!success) {
      console.error('Failed to write reviews to file')
      return res.status(500).json({ error: 'Failed to save review' })
    }

    console.log('✅ Review added successfully')

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      review: newReview
    })
  } catch (error) {
    console.error('❌ Error adding review:', error.message, error.stack)
    res.status(500).json({ 
      error: 'Failed to submit review',
      details: error.message 
    })
  }
}
