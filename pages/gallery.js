import Header from '../components/Header'
import Footer from '../components/Footer'
import gallery from '../data/gallery.json'
import MapEmbed from '../components/MapEmbed'
import { useEffect, useState } from 'react'

export default function Gallery(){
  const [openingTime, setOpeningTime] = useState('11:00')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/public/settings?t=' + Date.now())
        const data = await res.json()
        if (data.success && data.settings && data.settings.opening_time) {
          setOpeningTime(data.settings.opening_time)
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err)
      }
    }
    fetchSettings()
  }, [])
  return (
    <div>
      <Header />
      <main className="container py-6">
        <h1 className="text-2xl font-bold">Gallery</h1>
        <p className="text-sm text-gray-600">Photos & short videos from the restaurant and customers.</p>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {gallery.items.map((g,i)=> (
            <div key={i} className="rounded overflow-hidden bg-white">
              <img src={g.src} alt={g.alt} className="w-full h-40 object-cover" />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="font-semibold">Find us</h3>
          <div className="text-xs text-gray-400 mt-1">Opens at {openingTime} AM</div>
          <div className="mt-2"><MapEmbed /></div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
