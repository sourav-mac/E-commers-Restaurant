import { useEffect, useState } from 'react'

function parseTime(t){
  const [hh,mm] = t.split(':').map(Number)
  return {hh,mm}
}

export default function OpenStatus({ opensAt='11:00', closesAt='22:00' }){
  const [isOpen, setIsOpen] = useState(false)

  useEffect(()=>{
    function check(){
      const now = new Date()
      const { hh: openHh, mm: openMm } = parseTime(opensAt)
      const { hh: closeHh, mm: closeMm } = parseTime(closesAt)
      
      const openTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), openHh, openMm)
      let closeTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), closeHh, closeMm)
      
      // If closing time is earlier than opening time, it's next day (e.g., 4am is next morning)
      if (closeTime <= openTime) {
        closeTime = new Date(closeTime.getTime() + 24 * 60 * 60 * 1000) // Add 1 day
      }
      
      setIsOpen(now >= openTime && now < closeTime)
    }
    check()
    const t = setInterval(check, 10_000) // Check every 10 seconds for real-time updates
    return ()=>clearInterval(t)
  },[opensAt, closesAt])

  return (
    <div className={`text-sm px-3 py-1 rounded font-semibold ${isOpen? 'bg-green-600/30 text-green-300 border border-green-600':'bg-red-600/30 text-red-300 border border-red-600'}`}>
      {isOpen ? `Open — Closes at ${closesAt}` : `Closed — Opens at ${opensAt}`}
    </div>
  )
}
