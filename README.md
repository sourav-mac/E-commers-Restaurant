# 🍽️ Petuk (পেটুক) — Restaurant Website

> A modern, professional restaurant web platform for **Petuk**, a fine dining establishment in Rudranagar, Tetultala. Engineered with cutting-edge web technologies for optimal user experience across all devices.

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-13-000?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B2AC?style=flat&logo=tailwind-css)
![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

[View Demo](#) • [Documentation](#setup--installation) • [Support](#support)

</div>

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🏠 **Homepage** | Engaging hero section with restaurant rating, services highlights, and featured dishes |
| 📋 **Dynamic Menu** | Fully editable menu system with categories, prices, descriptions, and images |
| 📖 **About Us** | Restaurant story, values, and reasons to choose Petuk |
| 🛒 **Online Orders** | Seamless order form with Formspree integration |
| 🪑 **Reservations** | Easy table booking with API backend support |
| ⭐ **Reviews System** | Display customer testimonials and submit new reviews |
| 🖼️ **Gallery** | Photo gallery and embedded Google Map location |
| 📞 **Contact & Location** | Hours, contact information, and live open/closed status |
| 📱 **Fully Responsive** | Mobile-first design that works flawlessly on all devices |
| 🔍 **SEO Optimized** | Meta tags and schema.org support for better search visibility |

---

## 🛠️ Technology Stack

<table>
<tr>
<td width="50%">

**Frontend**
- Next.js 13 Framework
- React 18 Library
- Tailwind CSS Styling

</td>
<td width="50%">

**Backend & Data**
- JSON-based data storage
- Next.js API Routes
- Formspree Integration

</td>
</tr>
<tr>
<td width="50%">

**Additional Tools**
- Google Maps Embed
- Responsive Design System
- Modern build tooling

</td>
<td width="50%">

**Deployment Ready**
- Vercel (Recommended)
- Netlify Support
- DigitalOcean Compatible

</td>
</tr>
</table>

---

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** v16 or higher ([Download](https://nodejs.org))
- **npm** or **yarn** package manager
- **Git** for version control

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/sourav-mac/E-commers-Restaurant.git
   cd petuk
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
   Or if using yarn:
   ```bash
   yarn install
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the website.

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

---

## 📁 Project Structure

```
📦 petuk/
├── 📂 pages/                      # Next.js pages & routes
│   ├── _app.js                    # App wrapper & global settings
│   ├── index.js                   # 🏠 Homepage
│   ├── menu.js                    # 📋 Menu page
│   ├── about.js                   # 📖 About page
│   ├── order.js                   # 🛒 Order page
│   ├── cart.js                    # 🛍️ Shopping cart
│   ├── checkout.js                # 💳 Checkout page
│   ├── reserve.js                 # 🪑 Reservation page
│   ├── reviews.js                 # ⭐ Reviews page
│   ├── gallery.js                 # 🖼️ Gallery & map
│   ├── contact.js                 # 📞 Contact page
│   ├── track-order.js             # 📍 Order tracking
│   ├── my-orders.js               # 📦 My orders
│   ├── admin/                     # 🔐 Admin dashboard
│   └── api/                       # 🔌 API endpoints
│
├── 📂 components/                 # Reusable React components
│   ├── Header.js                  # Navigation header
│   ├── Footer.js                  # Footer
│   ├── Hero.js                    # Hero banner
│   ├── DishCard.js                # Menu item card
│   ├── ReviewList.js              # Review display
│   ├── StarRating.js              # Rating component
│   ├── HeartRating.js             # Favorite toggle
│   ├── OpenStatus.js              # Live status badge
│   ├── MapEmbed.js                # Google Map embed
│   ├── MiniCart.js                # Cart widget
│   └── GlobalNotificationToast.js # Notifications
│
├── 📂 context/                    # React Context API
│   ├── CartContext.js             # Shopping cart state
│   └── NotificationContext.js     # Notification state
│
├── 📂 data/                       # JSON data files
│   ├── site.json                  # Site configuration
│   ├── menu.json                  # Menu items
│   ├── reviews.json               # Customer reviews
│   ├── orders.json                # Order history
│   ├── gallery.json               # Gallery images
│   └── settings.json              # App settings
│
├── 📂 lib/                        # Utility functions
│   ├── dataStore.js               # Data management
│   ├── sms.js                     # SMS integration
│   └── sse.js                     # Server-sent events
│
├── 📂 styles/                     # Global styles
│   └── globals.css                # Tailwind CSS
│
├── 📂 public/                     # Static assets
│   ├── images/                    # Image files
│   └── notification.wav           # Notification sound
│
├── 📄 package.json                # Dependencies
├── 🎨 tailwind.config.js          # Tailwind configuration
├── 🔧 postcss.config.js           # PostCSS configuration
├── ⚙️ next.config.js              # Next.js configuration
└── 📄 README.md                   # This file
```

---

## 📖 Route Reference

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | index.js | 🏠 Homepage with hero, dishes & reviews |
| `/menu` | menu.js | 📋 Complete menu with all items |
| `/about` | about.js | 📖 Restaurant story and values |
| `/order` | order.js | 🛒 Place online orders |
| `/cart` | cart.js | 🛍️ Shopping cart |
| `/checkout` | checkout.js | 💳 Payment & delivery |
| `/reserve` | reserve.js | 🪑 Reserve a table |
| `/reviews` | reviews.js | ⭐ Customer testimonials |
| `/gallery` | gallery.js | 🖼️ Photos & location map |
| `/contact` | contact.js | 📞 Contact information |
| `/track-order` | track-order.js | 📍 Track orders |
| `/my-orders` | my-orders.js | 📦 Order history |
| `/admin/*` | admin/ | 🔐 Admin dashboard |

---

## ⚙️ Configuration

### 1. Update Restaurant Information

Edit **`data/site.json`**:
```json
{
  "name": "Petuk",
  "shortName": "পেটুক",
  "tagline": "Fine Dining Bengali Restaurant",
  "description": "Experience authentic Bengali cuisine...",
  "rating": "4.8",
  "totalReviews": 156,
  "phone": "+880 1974-97019",
  "email": "info@petuk.com",
  "address": "Rudranagar, Tetultala",
  "opensAt": "11:00",
  "closesAt": "23:00",
  "closedOn": "Monday"
}
```

### 2. Manage Menu Items

Edit **`data/menu.json`** to add/edit categories and dishes:
```json
{
  "categories": [
    {
      "id": "appetizers",
      "name": "Appetizers",
      "items": [
        {
          "id": "chicken-lollipop",
          "name": "Chicken Lollipop",
          "description": "Marinated chicken...",
          "price": 250,
          "image": "/images/chicken-lollipop.jpg",
          "available": true
        }
      ]
    }
  ]
}
```

### 3. Add Customer Reviews

Edit **`data/reviews.json`**:
```json
{
  "reviews": [
    {
      "id": 1,
      "name": "John Doe",
      "rating": 5,
      "text": "Amazing food and great service!",
      "image": "https://i.pravatar.cc/100?u=john",
      "reply": "Thank you for visiting!"
    }
  ]
}
```

### 4. Update Gallery

Edit **`data/gallery.json`**:
```json
{
  "gallery": [
    {
      "id": 1,
      "url": "/images/dish-1.jpg",
      "alt": "Chicken Lollipop",
      "type": "image"
    }
  ]
}
```

### 5. Customize Colors & Branding

Edit **`tailwind.config.js`**:
```javascript
theme: {
  colors: {
    // Your custom colors
    primary: '#8B0000',    // Maroon
    accent: '#CC5500',     // Terracotta
    light: '#F5F1E8',      // Cream
  }
}
```

---

## 🔌 API Integration

### Form Submissions

**Order Form**: Uses [Formspree](https://formspree.io)
- Create account at formspree.io
- Update form ID in `pages/order.js`

**Reservation API**: 
```javascript
// Endpoint: POST /api/reserve
// Data: { name, phone, date, time, guests }
// Returns: { success, message, bookingId }
```

### SMS Notifications (Optional)

Enable SMS confirmations via **Twilio**:
1. Sign up at [twilio.com](https://www.twilio.com)
2. Add credentials to environment variables
3. Uncomment SMS code in API routes

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

Vercel offers the fastest deployment for Next.js applications:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

**Benefits:**
- ✅ Automatic deployments from Git
- ✅ Built-in analytics
- ✅ Free SSL certificate
- ✅ Edge functions support

### Deploy to Netlify

```bash
# Build the project
npm run build

# Deploy using Netlify CLI
netlify deploy --prod --dir=.next
```

### Deploy to DigitalOcean

1. Create Ubuntu App Platform
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set start command: `npm start`

---

## 📝 Environment Variables

Create a **`.env.local`** file in the root directory:

```env
# Formspree
NEXT_PUBLIC_FORMSPREE_ID=your_form_id_here

# Google Maps (Optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here

# Twilio (Optional - for SMS)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid (Optional - for Email)
SENDGRID_API_KEY=your_api_key
```

---

## 🔒 Admin Panel

Access the admin dashboard at `/admin/login` to manage:
- 📋 Menu items and categories
- 📦 Orders and tracking
- ⭐ Customer reviews
- 💳 Payments
- 📊 Analytics
- ⚙️ Site settings

For detailed admin instructions, see [ADMIN.md](./ADMIN.md)

---

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📚 Additional Documentation

- 📖 [Admin Guide](./ADMIN.md) — Non-technical customization
- 🎨 [Design System](./RESPONSIVE_DESIGN_GUIDE.md) — Styling & themes
- 🧪 [Testing Guide](./TESTING_GUIDE.md) — Quality assurance
- 🛒 [Shopping Cart](./SHOPPING_CART_README.md) — Cart functionality
- 📅 [Reservations](./README_RESERVATIONS.md) — Booking system

---

## ❓ FAQ

**Q: Can I use this for my restaurant?**
A: Yes! The system is designed to be easily customizable for any restaurant.

**Q: Is this open source?**
A: Yes, this project is open source and licensed under MIT.

**Q: How do I add payment processing?**
A: You can integrate Stripe or Razorpay in the checkout page.

**Q: Can I use a database instead of JSON?**
A: Yes, you can replace JSON files with MongoDB, Firebase, or any CMS.

**Q: What are the hosting costs?**
A: Vercel offers free tier for small projects. Pricing scales with usage.

---

## 📞 Support & Contact

- 📧 **Email**: [mandalsourav026@gmail.com](mailto:mandalsourav026@gmail.com)
- 📱 **Phone**: +91 9832358231
- 🌐 **Website**: [Petuk Restaurant](https://petuk.com)
- 🐛 **Report Issues**: [GitHub Issues](https://github.com/sourav-mac/E-commers-Restaurant/issues)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Next.js and React communities
- Tailwind CSS for amazing styling
- Formspree for form handling
- Google Maps for location services

---

<div align="center">

### Made with ❤️ by [Sourav](https://github.com/sourav-mac)

⭐ If you found this helpful, please consider giving it a star!

</div>
