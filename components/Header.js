import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useLoading } from '../context/LoadingContext'
import MiniCart from './MiniCart'

export default function Header(){
  const router = useRouter()
  const { showLoading } = useLoading()
  const [menuOpen, setMenuOpen] = useState(false)

  const goToReserve = (e) => {
    e.preventDefault()
    showLoading('Opening reservation page...')
    router.push('/reserve')
  }

  return (
    <>
      <header className="bg-[var(--petuk-charcoal)] sticky top-0 z-30 border-b border-[var(--petuk-orange)]/20">
        <div className="container flex items-center justify-between py-3 md:py-4">
          {/* Logo */}
          <div>
            <Link href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[var(--petuk-orange)] to-[var(--petuk-orange-light)] flex items-center justify-center text-white font-bold text-lg md:text-xl">প</div>
              <div className="hidden sm:block">
                <div className="font-bold text-sm md:text-base text-[var(--petuk-orange)]">Petuk <span className="text-xs text-[var(--petuk-offwhite)]">(পেটুক)</span></div>
                <div className="text-xs text-gray-400">Rudranagar • Tetultala</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 items-center">
            <Link href="/menu" className="text-sm font-semibold text-[var(--petuk-orange)] hover:text-[var(--petuk-offwhite)] transition">Menu</Link>
            <button onClick={goToReserve} className="text-sm font-semibold text-[var(--petuk-orange)] hover:text-[var(--petuk-offwhite)] transition bg-transparent border-none cursor-pointer">Reserve</button>
            <Link href="/my-orders" className="text-sm font-semibold text-[var(--petuk-orange)] hover:text-[var(--petuk-offwhite)] transition">My Orders</Link>
            <Link href="/contact" className="text-sm font-semibold text-[var(--petuk-orange)] hover:text-[var(--petuk-offwhite)] transition">Contact</Link>
            <MiniCart />
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <MiniCart />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-[var(--petuk-orange)] hover:bg-black/30 rounded transition"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {menuOpen && (
          <nav className="md:hidden bg-[var(--petuk-charcoal)] border-t border-[var(--petuk-orange)]/20 py-4">
            <div className="container space-y-3">
              <Link href="/menu" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-semibold text-[var(--petuk-offwhite)] hover:text-[var(--petuk-orange)] transition">📱 Menu</Link>
              <button onClick={(e) => { setMenuOpen(false); goToReserve(e); }} className="block w-full text-left py-2 text-sm font-semibold text-[var(--petuk-offwhite)] hover:text-[var(--petuk-orange)] transition bg-transparent border-none cursor-pointer">🍽️ Reserve a Table</button>
              <Link href="/my-orders" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-semibold text-[var(--petuk-offwhite)] hover:text-[var(--petuk-orange)] transition">📦 My Orders</Link>
              <Link href="/contact" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-semibold text-[var(--petuk-offwhite)] hover:text-[var(--petuk-orange)] transition">📞 Contact</Link>
              <hr className="border-[var(--petuk-orange)]/20 my-2" />
              <a href="tel:+919999999999" className="block py-2 text-sm font-semibold text-[var(--petuk-orange)] hover:text-[var(--petuk-orange-light)] transition">📞 Call Now</a>
              <Link href="/menu" className="block py-2 text-sm font-semibold text-[var(--petuk-orange)] hover:text-[var(--petuk-orange-light)] transition">🛒 Order Online</Link>
            </div>
          </nav>
        )}
      </header>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-[var(--petuk-charcoal)] border-t border-[var(--petuk-orange)]/20 z-20">
        <div className="container flex gap-2 py-2">
          <a href="tel:+919999999999" className="flex-1 bg-[var(--petuk-orange)] hover:bg-[var(--petuk-orange-light)] text-white py-3 rounded font-semibold text-center text-sm transition touch-highlight">📞 Call</a>
          <Link href="/menu" className="flex-1 bg-[var(--petuk-orange)] hover:bg-[var(--petuk-orange-light)] text-white py-3 rounded font-semibold text-center text-sm transition touch-highlight">🛒 Order</Link>
        </div>
      </div>

      {/* Spacer for mobile bottom action bar */}
      <div className="h-20 md:hidden"></div>
    </>
  )
}
