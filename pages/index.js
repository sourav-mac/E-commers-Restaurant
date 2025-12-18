import Header from '../components/Header'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import DishCard from '../components/DishCard'
import ReviewList from '../components/ReviewList'
import site from '../data/site.json'
import menu from '../data/menu.json'
import reviews from '../data/reviews.json'

export default function Home(){
  // Calculate average rating and review count dynamically
  const reviewsCount = reviews.reviews?.length || 0
  const averageRating = reviewsCount > 0
    ? (reviews.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1)
    : site.rating

  return (
    <div>
      <Header />
      <main className="container">
        <Hero />

        <section className="mt-6">
          <h2 className="text-xl font-semibold">Popular dishes</h2>
          <p className="text-sm text-gray-600 mt-1">Browse our menu and add items to cart</p>
          <div className="mt-4 flex gap-4 overflow-x-auto py-2">
            {menu.items.slice(0,4).map((d,i)=> (
              <div key={i} className="card w-full max-w-xs flex-shrink-0">
                <img src={d.image || '/images/placeholder.jpg'} alt={d.name} className="w-full h-36 object-cover rounded mb-3" />
                <div>
                  <div className="font-bold text-[var(--petuk-orange)]">{d.name}</div>
                  <div className="text-xs text-gray-400 mt-1">₹{d.price}</div>
                  <div className="text-sm text-[var(--petuk-offwhite)] mt-2">{d.description}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold">Reviews • {averageRating} ({reviewsCount})</h2>
          <div className="mt-3">
            <ReviewList reviews={reviews.reviews} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
