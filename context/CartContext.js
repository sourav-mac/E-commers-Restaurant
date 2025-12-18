// context/CartContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react'

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const [subtotal, setSubtotal] = useState(0)
  const [tax, setTax] = useState(0)
  const [delivery_fee, setDeliveryFee] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [promoCode, setPromoCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('petuk_cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setItems(parsedCart.items || [])
        setPromoCode(parsedCart.promoCode || '')
        // Recalculate totals
        recalculateTotals(parsedCart.items || [], parsedCart.discount || 0)
      } catch (err) {
        console.error('Failed to load cart from localStorage:', err)
      }
    }
  }, [])

  // Calculate and update totals
  const recalculateTotals = useCallback(async (cartItems, discountAmount = 0) => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      setSubtotal(0)
      setTax(0)
      setDeliveryFee(0)  // No delivery fee for empty cart
      setDiscount(discountAmount)
      return
    }

    try {
      // Validate items with server
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems })
      })

      if (!response.ok) {
        throw new Error('Failed to validate cart')
      }

      const data = await response.json()
      setSubtotal(data.subtotal)
      setTax(data.tax)
      setDeliveryFee(data.delivery_fee)
      setDiscount(discountAmount)
    } catch (err) {
      console.error('Error calculating totals:', err)
      // Fallback calculation (don't trust this on actual purchase)
      const newSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0)
      setSubtotal(newSubtotal)
      setTax(0)
      setDeliveryFee(50)
      setDiscount(discountAmount)
    }
  }, [])

  // Add item to cart
  const addToCart = (item) => {
    setError('')
    const existingItem = items.find(i => i.item_id === item.item_id)

    let newItems
    if (existingItem) {
      newItems = items.map(i =>
        i.item_id === item.item_id
          ? { ...i, qty: Math.min(i.qty + (item.qty || 1), 100) }
          : i
      )
    } else {
      newItems = [...items, { ...item, qty: item.qty || 1 }]
    }

    setItems(newItems)
    recalculateTotals(newItems, discount)
    saveCartToLocalStorage(newItems, promoCode, discount)
  }

  // Update item quantity
  const updateQuantity = (item_id, qty) => {
    setError('')
    if (!Number.isInteger(qty) || qty < 0) return

    let newItems
    if (qty === 0) {
      newItems = items.filter(i => i.item_id !== item_id)
    } else {
      newItems = items.map(i =>
        i.item_id === item_id ? { ...i, qty: Math.min(qty, 100) } : i
      )
    }

    setItems(newItems)
    recalculateTotals(newItems, discount)
    saveCartToLocalStorage(newItems, promoCode, discount)
  }

  // Remove item
  const removeItem = (item_id) => {
    const newItems = items.filter(i => i.item_id !== item_id)
    setItems(newItems)
    recalculateTotals(newItems, discount)
    saveCartToLocalStorage(newItems, promoCode, discount)
  }

  // Apply promo code
  const applyPromo = async (code) => {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/cart/apply-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promo_code: code, subtotal })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Promo code invalid')
        return false
      }

      setPromoCode(code)
      setDiscount(data.discount)
      saveCartToLocalStorage(items, code, data.discount)
      return true
    } catch (err) {
      setError('Failed to apply promo code')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Remove promo code
  const removePromo = () => {
    setPromoCode('')
    setDiscount(0)
    saveCartToLocalStorage(items, '', 0)
  }

  // Clear cart
  const clearCart = () => {
    setItems([])
    setSubtotal(0)
    setTax(0)
    setDiscount(0)
    setPromoCode('')
    localStorage.removeItem('petuk_cart')
  }

  // Save cart to localStorage
  const saveCartToLocalStorage = (cartItems, code, discountAmount) => {
    localStorage.setItem('petuk_cart', JSON.stringify({
      items: cartItems,
      promoCode: code,
      discount: discountAmount,
      timestamp: new Date().toISOString()
    }))
  }

  const total = subtotal + tax + delivery_fee - discount

  return (
    <CartContext.Provider value={{
      items,
      subtotal,
      tax,
      delivery_fee,
      discount,
      total,
      promoCode,
      loading,
      error,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      applyPromo,
      removePromo
    }}>
      {children}
    </CartContext.Provider>
  )
}
