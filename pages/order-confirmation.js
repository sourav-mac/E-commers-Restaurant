import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function OrderConfirmationPage() {
  const router = useRouter()
  const { order_id } = router.query

  return (
    <div className="flex flex-col min-h-screen bg-[var(--petuk-charcoal)]">
      <Header />
      <main className="flex-grow py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30 rounded-lg p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-[var(--petuk-orange)] mb-4">Order Confirmed!</h1>
            <p className="text-gray-300 mb-4">
              Thank you for your order. Your order ID is: <span className="font-bold text-[var(--petuk-orange)]">{order_id || 'N/A'}</span>
            </p>
            <p className="text-gray-400 mb-8">
              You will receive an SMS update shortly with your order status and estimated delivery time.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/" className="px-6 py-2 bg-[var(--petuk-orange)] text-white rounded hover:bg-orange-600 transition">
                Continue Shopping
              </Link>
              <Link href="/my-orders" className="px-6 py-2 bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)] text-[var(--petuk-orange)] rounded hover:bg-[var(--petuk-orange)]/10 transition">
                Track Order
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
