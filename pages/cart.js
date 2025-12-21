// pages/cart.js
'use client'

import { useContext, useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { CartContext } from '../context/CartContext'
import { useLoading } from '../context/LoadingContext'

export default function CartPage() {
  const { items, subtotal, tax, delivery_fee, discount, total, promoCode, error, updateQuantity, removeItem, applyPromo, removePromo } = useContext(CartContext)
  const { showLoading, hideLoading } = useLoading()
  const [promoInput, setPromoInput] = useState('')
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [settings, setSettings] = useState({ min_order_value: 0 })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/public/settings?t=' + Date.now()) // Cache buster
        const data = await res.json()
        if (data.success && data.settings) {
          setSettings(data.settings)
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err)
      }
    }
    fetchSettings()
  }, [])

  const handleApplyPromo = async () => {
    setIsApplyingPromo(true)
    const success = await applyPromo(promoInput)
    if (success) {
      setPromoInput('')
    }
    setIsApplyingPromo(false)
  }

  if (items.length === 0) {
    return (
      <div>
        <Header />
        <main className="container py-12 md:py-16">
          <div className="text-center">
            <div className="text-5xl md:text-6xl mb-4">🛒</div>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-400 mb-6 text-sm md:text-base">যান, কিছুও যুক্ত করুন!</p>
            <Link href="/menu">
              <button className="btn-uiverse px-6 md:px-8 py-3 md:py-4 text-sm md:text-base">
                Continue Shopping
              </button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div>
      <Header />
      <main className="container py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--petuk-orange)] mb-6">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-2 md:space-y-3 bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 p-3 md:p-4 rounded">
              {items.map((item) => (
                <div key={item.item_id} className="bg-black/30 hover:bg-black/50 p-3 md:p-4 rounded border border-[var(--petuk-orange)]/20 transition flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm md:text-base text-[var(--petuk-orange)] break-words">{item.name}</h3>
                    <p className="text-xs md:text-sm text-gray-400 mt-1">₹{item.price} × {item.qty}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 md:gap-2 bg-[var(--petuk-charcoal)] rounded border border-[var(--petuk-orange)]/30 flex-shrink-0">
                    <button
                      onClick={() => updateQuantity(item.item_id, item.qty - 1)}
                      className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center hover:bg-[var(--petuk-orange)]/20 text-[var(--petuk-orange)] transition"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-6 md:w-8 text-center font-semibold text-[var(--petuk-offwhite)] text-xs md:text-sm">{item.qty}</span>
                    <button
                      onClick={() => updateQuantity(item.item_id, item.qty + 1)}
                      className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center hover:bg-[var(--petuk-orange)]/20 text-[var(--petuk-orange)] transition"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right flex-shrink-0 sm:min-w-20">
                    <div className="font-bold text-sm md:text-base text-[var(--petuk-orange)]">₹{item.price * item.qty}</div>
                    <button
                      onClick={() => removeItem(item.item_id)}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--petuk-charcoal)]/50 border border-[var(--petuk-orange)]/30 p-4 md:p-6 rounded sticky top-24 md:top-20">
              <h2 className="text-lg font-bold mb-4 text-[var(--petuk-orange)]">Order Summary</h2>

              <div className="space-y-2 text-xs md:text-sm mb-4 text-[var(--petuk-offwhite)]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span className="font-semibold">₹{tax}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span className="font-semibold">₹{delivery_fee}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span className="font-semibold">−₹{discount}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between font-bold text-base md:text-lg">
                  <span>Total:</span>
                  <span className="text-[var(--petuk-orange)]">₹{total}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-4">
                {promoCode ? (
                  <div className="flex items-center gap-2 bg-green-50 p-2 rounded mb-2">
                    <span className="text-xs md:text-sm">✓ {promoCode}</span>
                    <button
                      onClick={removePromo}
                      className="ml-auto text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      className="flex-1 px-2 py-2 md:py-1 border rounded text-xs md:text-sm"
                      disabled={isApplyingPromo}
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={!promoInput || isApplyingPromo}
                      className="px-3 md:px-2 py-2 md:py-1 bg-[var(--petuk-orange)] text-white text-xs md:text-sm rounded hover:bg-[var(--petuk-orange-light)] disabled:opacity-50 transition whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>

              {/* Minimum Order Value Warning */}
              {settings.min_order_value > 0 && subtotal < settings.min_order_value && (
                <div className="bg-red-600/20 border border-red-600 text-red-300 p-3 rounded mb-4 text-xs md:text-sm">
                  ⚠️ Minimum order value is ₹{settings.min_order_value}. Add ₹{settings.min_order_value - subtotal} more to proceed.
                </div>
              )}

              {/* Checkout Button */}
              <Link href="/checkout" onClick={(e) => {
                if (settings.min_order_value > 0 && subtotal < settings.min_order_value) {
                  e.preventDefault()
                }
              }}>
                <button 
                  disabled={settings.min_order_value > 0 && subtotal < settings.min_order_value}
                  className="btn-uiverse w-full py-3 md:py-4 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
              </Link>

              <Link href="/menu">
                <button className="btn-uiverse-outline w-full mt-2 py-2 md:py-3 text-sm md:text-base">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
