export default function Footer(){
  return (
    <footer className="bg-[var(--petuk-charcoal)] mt-12 border-t border-[var(--petuk-orange)]/20">
      <div className="container py-8 flex flex-col md:flex-row md:justify-between gap-6">
        <div>
          <div className="font-bold text-[var(--petuk-orange)]">Petuk (পেটুক)</div>
          <div className="text-sm text-gray-400 mt-2">P4M4+M6M, Rudranagar, Tetultala, West Bengal 743373</div>
          <div className="text-sm text-gray-400 mt-1">Phone: <a href="tel:09647497019" className="text-[var(--petuk-orange)] hover:text-[var(--petuk-orange-light)]">096474 97019</a></div>
        </div>
        <div className="text-sm text-gray-400">
          © {new Date().getFullYear()} Petuk — All rights reserved
        </div>
      </div>
    </footer>
  )
}
