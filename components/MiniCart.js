// components/MiniCart.js
import React, { useContext, useState } from 'react'
import Link from 'next/link'
import { CartContext } from '../context/CartContext'

export default function MiniCart() {
  const { items, subtotal, total } = useContext(CartContext)
  const [isOpen, setIsOpen] = useState(false)

  const itemCount = items.reduce((sum, item) => sum + item.qty, 0)

  return (
    <>
      {/* Cart Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 px-3 py-2 text-white hover:bg-[var(--petuk-orange-light)] rounded transition"
        title="View cart"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 4V3c0-.552-.448-1-1-1s-1 .448-1 1v1H2c-.552 0-1 .448-1 1v3c0 .552.448 1 1 1h.033l1.635 13.083C4.81 23.126 6.244 24 7.865 24h8.27c1.62 0 3.055-.874 3.197-2.834L21.967 9H22c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1h-2V3c0-.552-.448-1-1-1s-1 .448-1 1v1H7zm0 2h10v1H7V6zm11.08 10.324c-.086.69-.644 1.176-1.334 1.176h-8.27c-.69 0-1.248-.487-1.334-1.176L7.117 9h9.766l-1.025 8.324zM8 14c0 .552.448 1 1 1s1-.448 1-1v-3c0-.552-.448-1-1-1s-1 .448-1 1v3zm4 0c0 .552.448 1 1 1s1-.448 1-1v-3c0-.552-.448-1-1-1s-1 .448-1 1v3zm4 0c0 .552.448 1 1 1s1-.448 1-1v-3c0-.552-.448-1-1-1s-1 .448-1 1v3z" />
        </svg>
        {itemCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
        <span className="text-sm font-semibold hidden sm:inline">₹{total}</span>
      </button>

      {/* Cart Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[var(--petuk-charcoal)] shadow-lg p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--petuk-orange)]">Your Cart</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--petuk-orange)] hover:text-[var(--petuk-orange-light)]"
              >
                ✕
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-[var(--petuk-offwhite)]/60 text-center py-8">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.item_id} className="flex gap-2 p-2 bg-[var(--petuk-dark)] rounded border border-[var(--petuk-orange)]/20">
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-[var(--petuk-offwhite)]">{item.name}</div>
                        <div className="text-xs text-[var(--petuk-offwhite)]/60">₹{item.price}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[var(--petuk-orange)]">₹{item.price * item.qty}</div>
                        <div className="text-xs text-[var(--petuk-offwhite)]/60">Qty: {item.qty}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--petuk-orange)]/20 pt-3 mb-4 text-sm">
                  <div className="flex justify-between mb-1 text-[var(--petuk-offwhite)]">
                    <span>Subtotal:</span>
                    <span className="text-[var(--petuk-orange)] font-semibold">₹{subtotal}</span>
                  </div>
                </div>
                <Link href="/cart">
                  <button className="btn-uiverse w-full py-2">
                    View Cart
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
