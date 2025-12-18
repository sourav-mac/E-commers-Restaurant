import Header from '../components/Header'
import Footer from '../components/Footer'
import site from '../data/site.json'

export default function About(){
  return (
    <div>
      <Header />
      <main className="container py-6">
        <h1 className="text-2xl font-bold">About Petuk (পেটুক)</h1>
        <p className="mt-3 text-gray-700">Petuk brings warm, family-friendly dining to Rudranagar with flavours inspired by Gangasagar. {site.aboutLine}</p>

        <section className="mt-6 card">
          <h3 className="font-semibold">Why choose Petuk?</h3>
          <ul className="mt-2 list-disc list-inside text-gray-700">
            <li>Freshly prepared local recipes</li>
            <li>Cozy dining with quick service</li>
            <li>Affordable prices — ₹200–₹400 per person</li>
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  )
}
