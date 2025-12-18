# Petuk Website — Admin Guide

## Quick Edits (No Coding Required)

### 1. Update Restaurant Hours
File: `data/site.json`
```json
{
  "opensAt": "11:00"
}
```

### 2. Update Menu Items & Prices
File: `data/menu.json`
```json
{
  "categories": [
    {
      "name": "Popular",
      "items": [
        { "name": "Item Name", "desc": "Description", "price": 180 }
      ]
    }
  ]
}
```

### 3. Update Reviews
File: `data/reviews.json`
```json
{
  "reviews": [
    {
      "author": "Customer Name",
      "rating": 5,
      "quote": "Great food and service!",
      "ownerReply": "Thank you!"
    }
  ]
}
```

### 4. Update Phone & Address
File: `data/site.json`
```json
{
  "phone": "096474 97019",
  "address": "P4M4+M6M, Rudranagar, Tetultala, West Bengal 743373"
}
```

### 5. Update Gallery Photos
Edit `data/gallery.json` and add image URLs:
```json
{
  "items": [
    { "src": "https://example.com/photo.jpg", "alt": "Description" }
  ]
}
```

## Form Integrations

### Order Form Setup
1. Go to [formspree.io](https://formspree.io)
2. Create free account
3. Replace form ID in `pages/order.js` with your own

### Reservation API
Endpoint: `/api/reserve`
- Logs reservation data
- To add SMS: integrate Twilio in `pages/api/reserve.js`

## Customizing Colors

File: `tailwind.config.js`
```javascript
colors: {
  petuk: {
    maroon: '#7b2e2e',      // Primary
    terracotta: '#d97646',  // Accent
    cream: '#f6efe6',       // Background
    mustard: '#d1a100'      // CTA buttons
  }
}
```

## SEO Optimization

Add meta tags to each page (example for menu):
```javascript
import Head from 'next/head'

export default function Menu() {
  return (
    <>
      <Head>
        <title>Petuk Menu — Bengali Dishes in Rudranagar</title>
        <meta name="description" content="View our menu with prices" />
      </Head>
    </>
  )
}
```

## Deployment

### Vercel (Free, Recommended)
```bash
vercel login
vercel
```

### Google My Business
1. Go to google.com/business
2. Verify restaurant
3. Add hours, photos, reviews

## Monitoring

### Google Analytics
Add to `pages/_app.js`:
```javascript
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_ID"></script>
```

## Support

For technical issues, refer to `README.md` or contact your developer.
