'use client'

import { useContext, useState, useEffect, useRef } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { CartContext } from '../context/CartContext'

export default function Menu(){
  const { items: cartItems, addToCart, updateQuantity: cartUpdateQuantity } = useContext(CartContext)
  const [quantities, setQuantities] = useState({})
  const [menu, setMenu] = useState({ categories: [], items: [] })
  const [loading, setLoading] = useState(true)

  // Fetch menu from API
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/public/menu')
        const data = await res.json()
        if (data.success) {
          setMenu(data.menu)
        }
      } catch (err) {
        console.error('Failed to fetch menu:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [])

  // Sync menu quantities with cart items on mount and when cart changes
  useEffect(() => {
    const newQuantities = {}
    cartItems.forEach(cartItem => {
      newQuantities[cartItem.item_id] = cartItem.qty
    })
    setQuantities(newQuantities)
  }, [cartItems])

  const updateQuantity = (itemIndex, value, item) => {
    const newQty = Math.max(0, Math.min(100, value))
    const oldQty = quantities[itemIndex] ?? 0
    setQuantities({ ...quantities, [itemIndex]: newQty })
    
    // If adding first item (0 to 1+), use addToCart
    if (oldQty === 0 && newQty > 0) {
      addToCart({
        item_id: itemIndex,
        name: item.name,
        price: item.price,
        qty: newQty
      })
    } else {
      // Otherwise use updateQuantity for exact quantity
      cartUpdateQuantity(itemIndex, newQty)
    }
  }

  const downloadPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let yPosition = 20

      // Title
      doc.setFontSize(24)
      doc.setTextColor(255, 122, 0) // Orange
      doc.text('Petuk', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 10

      // Subtitle
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text('Restaurant Menu', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 15

      // Menu items
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)

      menu.categories.forEach(category => {
        // Category header
        doc.setFontSize(12)
        doc.setTextColor(255, 122, 0)
        doc.setFont(undefined, 'bold')
        
        if (yPosition > pageHeight - 30) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.text(category, 15, yPosition)
        yPosition += 8

        // Category divider
        doc.setDrawColor(255, 122, 0)
        doc.setLineWidth(0.5)
        doc.line(15, yPosition, pageWidth - 15, yPosition)
        yPosition += 6

        // Items
        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.setTextColor(0, 0, 0)

        const categoryItems = menu.items.filter(item => item.category === category)
        categoryItems.forEach(item => {
          if (yPosition > pageHeight - 15) {
            doc.addPage()
            yPosition = 20
          }

          // Item name
          doc.setFont(undefined, 'bold')
          doc.text(item.name, 15, yPosition, { maxWidth: pageWidth - 45 })
          
          // Price on the right
          doc.setTextColor(255, 122, 0)
          doc.text(`₹${item.price}`, pageWidth - 15, yPosition, { align: 'right' })
          
          yPosition += 7

          // Out of stock indicator
          if (!item.available) {
            doc.setTextColor(200, 0, 0)
            doc.setFontSize(8)
            doc.text('Out of stock', 15, yPosition)
            yPosition += 5
            doc.setFontSize(10)
          }

          doc.setTextColor(0, 0, 0)
        })

        yPosition += 8
      })

      // Footer
      if (yPosition <= pageHeight - 15) {
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text('Thank you for choosing Petuk!', pageWidth / 2, pageHeight - 10, { align: 'center' })
      }

      doc.save('Petuk-Menu.pdf')
    } catch (error) {
      console.error('Failed to download PDF:', error)
      alert('Failed to download menu. Please try again.')
    }
  }

  return (
    <div>
      <Header />
      <main className="container py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--petuk-orange)] mb-2">Menu</h1>
        <p className="text-sm md:text-base text-[var(--petuk-offwhite)] mt-1">Select items and add to cart</p>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading menu...</div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {menu.categories.map((category, idx) => (
              <section key={idx} className="card bg-[var(--petuk-charcoal)] border border-[var(--petuk-orange)]/30">
                <h3 className="font-semibold text-base md:text-lg mb-3 text-[var(--petuk-orange)]">{category}</h3>
                <div className="mt-2 space-y-3">
                  {menu.items.filter(item => item.category === category).map((item, i) => {
                    const itemIndex = menu.items.findIndex(x => x._id === item._id)
                    const qty = quantities[itemIndex] ?? 0
                    return (
                      <div key={i} className="flex justify-between items-start p-3 bg-black/30 hover:bg-black/50 rounded border border-[var(--petuk-orange)]/20 transition gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs md:text-sm text-[var(--petuk-offwhite)] break-words">{item.name}</div>
                          <div className="text-sm font-semibold text-[var(--petuk-orange)] mt-1">₹{item.price}</div>
                          {!item.available && <div className="text-xs text-red-400 mt-1">Out of stock</div>}
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                          <button
                            onClick={() => updateQuantity(itemIndex, qty - 1, item)}
                            className="w-8 h-8 md:w-9 md:h-9 bg-[var(--petuk-orange)] hover:bg-[var(--petuk-orange-light)] rounded font-bold text-sm text-white transition disabled:opacity-50 flex items-center justify-center"
                            disabled={!item.available}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-6 md:w-8 text-center font-semibold text-[var(--petuk-offwhite)] text-xs md:text-sm">{qty}</span>
                          <button
                            onClick={() => updateQuantity(itemIndex, qty + 1, item)}
                            className="w-8 h-8 md:w-9 md:h-9 bg-[var(--petuk-orange)] hover:bg-[var(--petuk-orange-light)] rounded font-bold text-sm text-white transition disabled:opacity-50 flex items-center justify-center"
                            disabled={!item.available}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button onClick={downloadPDF} className="btn-uiverse px-4 py-3 md:py-2 text-sm md:text-base">📄 Download PDF</button>
          <a className="btn-uiverse-outline px-4 py-3 md:py-2 text-sm md:text-base flex items-center justify-center gap-2" href="#">🔗 Share</a>
        </div>
      </main>
      <Footer />
    </div>
  )
}
