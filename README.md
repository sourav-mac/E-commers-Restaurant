# Petuk (পেটুক) — Restaurant Website

A professional, mobile-first Next.js website for **Petuk**, a local restaurant in Rudranagar, Tetultala. Built with **React**, **Next.js 13**, and **Tailwind CSS**.

## Features

✅ **Homepage** — Hero with rating, services, popular dishes, and reviews  
✅ **Menu** — Editable categories with prices and descriptions  
✅ **About** — Story and why choose Petuk  
✅ **Order** — Online order form (Formspree integration)  
✅ **Reservations** — Table reservation form with API route  
✅ **Reviews** — Display and submit customer reviews  
✅ **Gallery** — Photo/video gallery + embedded Google Map  
✅ **Contact** — Location, hours, contact form, live open/closed status  
✅ **Responsive** — Mobile-first design, Tailwind CSS  
✅ **SEO-ready** — Meta tags, schema.org support (ready to add)  

## Tech Stack

- **Frontend**: Next.js 13, React 18, Tailwind CSS
- **Data**: JSON files in `data/` (can be replaced with Sanity, Strapi, or Netlify CMS)
- **Forms**: Formspree (free form backend)
- **Maps**: Google Maps embed
- **Hosting**: Ready for Vercel, Netlify, or DigitalOcean

## Setup & Installation

### Prerequisites
- Node.js 16+
- npm or yarn

### Steps

1. **Navigate to the project folder**
   ```bash
   cd "c:\Users\Lenovo\OneDrive\Desktop\New folder"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run locally**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` in your browser.

4. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
petuk-website/
├── pages/
│   ├── _app.js           # App wrapper
│   ├── index.js          # Homepage
│   ├── menu.js           # Menu page
│   ├── about.js          # About page
│   ├── order.js          # Order page
│   ├── reserve.js        # Reservation page
│   ├── reviews.js        # Reviews page
│   ├── gallery.js        # Gallery & map
│   ├── contact.js        # Contact & location
│   └── api/
│       └── reserve.js    # Reservation API endpoint
├── components/
│   ├── Header.js         # Navigation header
│   ├── Footer.js         # Footer
│   ├── Hero.js           # Hero banner
│   ├── DishCard.js       # Menu item card
│   ├── ReviewList.js     # Review display
│   ├── OpenStatus.js     # Live open/closed badge
│   └── MapEmbed.js       # Google Map embed
├── data/
│   ├── site.json         # Site metadata
│   ├── menu.json         # Menu items & categories
│   ├── reviews.json      # Customer reviews
│   └── gallery.json      # Gallery images
├── styles/
│   └── globals.css       # Global Tailwind styles
├── public/
│   └── images/           # Hero, dish, gallery images (placeholders)
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── package.json
```

## Key Pages & Routes

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Hero, dishes, reviews, CTAs |
| Menu | `/menu` | Full editable menu |
| About | `/about` | Restaurant story |
| Order | `/order` | Online order form |
| Reserve | `/reserve` | Table reservation |
| Reviews | `/reviews` | All reviews + submit |
| Gallery | `/gallery` | Photos + map |
| Contact | `/contact` | Location, hours, message |

## Customization

### Update Restaurant Info
Edit `data/site.json`:
```json
{
  "name": "Petuk",
  "rating": "4.3",
  "phone": "096474 97019",
  "opensAt": "11:00"
}
```

### Add Menu Items
Edit `data/menu.json` — add categories and items with prices and descriptions.

### Update Reviews
Edit `data/reviews.json` — add customer reviews with ratings and owner replies.

### Update Gallery
Edit `data/gallery.json` — add image URLs.

### Change Colors
Edit `tailwind.config.js` — customize petuk colors (maroon, terracotta, cream, mustard).

## Forms & Integrations

### Order Form
Uses Formspree (free service). To customize:
- Edit the form ID in `pages/order.js`
- Go to formspree.io to create your account

### Reservation Form
Submits to `/api/reserve` endpoint. Can integrate SMS/email confirmations with Twilio or SendGrid.

## Deployment

### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Option 2: Netlify
```bash
npm run build
# Deploy the dist folder to Netlify
```

## Support

For customization help, see `ADMIN.md` for non-technical edits.
