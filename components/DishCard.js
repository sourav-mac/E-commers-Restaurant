'use client'

import { useContext, useState } from 'react'
import { CartContext } from '../context/CartContext'

export default function DishCard({ dish }) {
  const { addToCart } = useContext(CartContext)
  const [qty, setQty] = useState(1)
  const [showQtySelector, setShowQtySelector] = useState(false)

  const handleAddToCart = () => {
    addToCart({
      item_id: dish.id,
      name: dish.name,
      price: dish.price,
      qty
    })
    setQty(1)
    setShowQtySelector(false)
    // Show toast (optional)
    alert(`✓ ${dish.name} added to cart!`)
  }

  return (
    <div className="card w-full max-w-xs">
      <img src={dish.image || '/images/placeholder.jpg'} alt={dish.name} className="w-full h-36 object-cover rounded mb-3" />
      <div>
        <div className="font-bold text-[var(--petuk-orange)]">{dish.name}</div>
        <div className="text-xs text-gray-400 mt-1">₹{dish.price}</div>
        <div className="text-sm text-[var(--petuk-offwhite)] mt-2">{dish.description}</div>

        {/* Add to Cart Button */}
        <div className="mt-3">
          {!showQtySelector ? (
            <button
              onClick={() => setShowQtySelector(true)}
              className="w-full bg-[var(--petuk-orange)] text-white py-2 rounded font-semibold hover:bg-[var(--petuk-orange-light)] transition"
            >
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="flex-1 bg-gray-300 hover:bg-gray-400 py-2 rounded font-semibold transition"
              >
                −
              </button>
              <span className="flex-1 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty(Math.min(100, qty + 1))}
                className="flex-1 bg-gray-300 hover:bg-gray-400 py-2 rounded font-semibold transition"
              >
                +
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[var(--petuk-orange)] text-white py-2 rounded font-semibold hover:bg-[var(--petuk-orange-light)] transition"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
