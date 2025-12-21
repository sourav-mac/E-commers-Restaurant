import { useContext, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import Footer from '../components/Footer'
import NeonCheckbox from '../components/NeonCheckbox'
import { CartContext } from '../context/CartContext'
import { useLoading } from '../context/LoadingContext'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, tax, delivery_fee, discount, total, clearCart } = useContext(CartContext)
  const { showLoading, hideLoading } = useLoading()

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [address, setAddress] = useState('')
  const [instructions, setInstructions] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState({
    payment_methods: { cod: true, razorpay: true }
  })

  // Fetch settings and load Razorpay script
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/public/settings?t=' + Date.now()) // Cache buster
        const data = await res.json()
        if (data.success && data.settings) {
          setSettings(data.settings)
          // Set default payment method based on available options
          if (data.settings.payment_methods?.razorpay) {
            setPaymentMethod('razorpay')
          } else if (data.settings.payment_methods?.cod) {
            setPaymentMethod('cod')
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err)
      }
    }
    fetchSettings()

    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items.length, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    showLoading('Creating your order...')
    setError('')

    // Validate minimum order value
    if (settings.min_order_value && subtotal < settings.min_order_value) {
      setError(`Minimum order value is ₹${settings.min_order_value}. Current order: ₹${subtotal}`)
      setIsLoading(false)
      hideLoading()
      return
    }

    // Validate inputs
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Name and phone number are required')
      setIsLoading(false)
      hideLoading()
      return
    }

    // Validate phone number is exactly 10 digits
    if (!/^\d{10}$/.test(customerPhone.trim())) {
      setError('Phone number must be exactly 10 digits')
      setIsLoading(false)
      hideLoading()
      return
    }

    if (!address.trim()) {
      setError('Delivery address is required')
      setIsLoading(false)
      hideLoading()
      return
    }

    try {
      // Create order
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: customerName,
            phone: customerPhone,
            email: customerEmail
          },
          items,
          payment_method: paymentMethod,
          address: address || 'Pickup',
          instructions,
          promo_discount: discount
        })
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || 'Failed to create order'
        console.error('Order creation error:', data)
        setError(errorMsg)
        setIsLoading(false)
        hideLoading()
        return
      }

      if (paymentMethod === 'razorpay') {
        // Load Razorpay script
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        script.onload = () => {
          handleRazorpayPayment(data)
        }
        document.body.appendChild(script)
      } else {
        // COD - Order confirmed
        clearCart()
        hideLoading()
        router.push(`/order-confirmation?order_id=${data.order_id}`)
      }
    } catch (err) {
      setError('Failed to create order: ' + err.message)
      setIsLoading(false)
      hideLoading()
    }
  }

  const handleRazorpayPayment = (orderData) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_test_RrcPAcvB65TfFu',
      amount: orderData.amount, // in paise
      currency: 'INR',
      name: 'Petuk Restaurant',
      description: 'Order for ' + customerName,
      order_id: orderData.razorpay_order_id,
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone
      },
      handler: async (response) => {
        // Verify payment on server
        try {
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderData.order_id
            })
          })

          const verifyData = await verifyResponse.json()

          if (verifyResponse.ok) {
            clearCart()
            hideLoading()
            router.push(`/order-confirmation?order_id=${orderData.order_id}`)
          } else {
            setError('Payment verification failed: ' + verifyData.error)
            setIsLoading(false)
            hideLoading()
          }
        } catch (err) {
          setError('Payment verification error: ' + err.message)
          setIsLoading(false)
          hideLoading()
        }
      },
      modal: {
        ondismiss: () => {
          setIsLoading(false)
          hideLoading()
        }
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div>
      <Header />
      <main className="container py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--petuk-orange)] mb-6 md:mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              {error && (
                <div className="bg-red-600/20 border border-red-500/50 p-4 rounded">
                  <p className="text-red-400 text-xs md:text-sm">{error}</p>
                </div>
              )}

              {/* Customer Info */}
              <div>
                <h2 className="text-lg md:text-xl font-bold mb-4 text-[var(--petuk-orange)]">Customer Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm font-semibold mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full border rounded px-3 md:px-4 py-3 md:py-2 text-sm md:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold mb-2">Phone Number * (10 digits)</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                        setCustomerPhone(value)
                      }}
                      className="w-full border rounded px-3 md:px-4 py-3 md:py-2 text-sm md:text-base"
                      placeholder="9876543210"
                      maxLength="10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold mb-2">Email (optional)</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full border rounded px-3 md:px-4 py-3 md:py-2 text-sm md:text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-lg md:text-xl font-bold mb-4 text-[var(--petuk-orange)]">Payment Method</h2>
                <div className="space-y-4">
                  {settings.payment_methods?.razorpay && (
                    <div className="p-3 md:p-4 border border-[var(--petuk-orange)]/30 rounded bg-[var(--petuk-charcoal)]/30 hover:bg-[var(--petuk-orange)]/10 transition text-white">
                      <NeonCheckbox
                        id="razorpay"
                        name="payment_razorpay"
                        label="Credit/Debit Card, UPI, or Wallet (Razorpay)"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        value="razorpay"
                      />
                    </div>
                  )}
                  {settings.payment_methods?.cod && (
                    <div className="p-3 md:p-4 border border-[var(--petuk-orange)]/30 rounded bg-[var(--petuk-charcoal)]/30 hover:bg-[var(--petuk-orange)]/10 transition text-white">
                      <NeonCheckbox
                        id="cod"
                        name="payment_cod"
                        label="Cash on Delivery"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        value="cod"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h2 className="text-lg md:text-xl font-bold mb-4 text-[var(--petuk-orange)]">Delivery Address</h2>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border rounded px-3 md:px-4 py-3 md:py-2 text-sm md:text-base"
                  rows="3"
                  placeholder="Enter your full delivery address"
                  required
                />
              </div>

              {/* Special Instructions */}
              <div>
                <h2 className="text-lg md:text-xl font-bold mb-4 text-[var(--petuk-orange)]">Special Instructions (optional)</h2>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full border rounded px-3 md:px-4 py-3 md:py-2 text-sm md:text-base"
                  rows="2"
                  placeholder="E.g., Leave at door, avoid onions, etc."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-uiverse w-full py-3 md:py-4 text-sm md:text-base disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : `Pay ₹${total} - অর্ডার করুন`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--petuk-charcoal)]/50 border border-[var(--petuk-orange)]/30 p-4 md:p-6 rounded sticky top-24 md:top-20">
              <h2 className="text-base md:text-lg font-bold mb-4 text-[var(--petuk-orange)]">Order Summary</h2>

              <div className="space-y-2 md:space-y-3 mb-4 max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.item_id} className="flex justify-between text-xs md:text-sm text-[var(--petuk-offwhite)]">
                    <span className="break-words flex-1">{item.name} × {item.qty}</span>
                    <span className="font-semibold text-[var(--petuk-orange)] ml-2">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--petuk-orange)]/30 pt-3 md:pt-4 space-y-2 text-xs md:text-sm text-[var(--petuk-offwhite)]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>₹{tax}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>₹{delivery_fee}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount:</span>
                    <span>−₹{discount}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-[var(--petuk-orange)]/30 pt-3 md:pt-4 mt-3 md:mt-4">
                <div className="flex justify-between font-bold text-base md:text-lg text-[var(--petuk-offwhite)]">
                  <span>Total:</span>
                  <span className="text-[var(--petuk-orange)]">₹{total}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-4 text-center">
                Estimated delivery: 30-45 minutes
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
