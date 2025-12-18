# Petuk Shopping Cart & Checkout System

A complete mobile-first e-commerce solution for the Petuk Restaurant website with cart management, Razorpay payment integration, and admin order management.

## Features

### User-Facing Features
- ✅ **Add to Cart** - Quick item selection with quantity controls
- ✅ **Mini-Cart** - Header icon showing item count and total (mobile drawer)
- ✅ **Cart Management** - Full cart page with item list, quantity controls, remove buttons
- ✅ **Persistent Cart** - Saved to localStorage for anonymous users
- ✅ **Promo Codes** - Server-side validation with discount application
- ✅ **Checkout Flow** - Customer info collection, address, payment method selection
- ✅ **Razorpay Integration** - Online payments (Card/UPI/Wallet)
- ✅ **Cash on Delivery** - Alternative payment option
- ✅ **Order Confirmation** - Receipt with status tracking
- ✅ **Order Tracking** - Status updates (Confirmed → Preparing → Out for Delivery → Delivered)
- ✅ **Mobile-First** - Responsive design optimized for all devices

### Admin Features
- ✅ **Live Orders Dashboard** - View all incoming orders
- ✅ **Status Management** - Update order status with customer notifications
- ✅ **Order Details** - View customer info, items, address, special instructions

## Technical Stack

- **Frontend**: Next.js 13, React 18, Tailwind CSS
- **State Management**: React Context API with localStorage persistence
- **Payments**: Razorpay API
- **Backend**: Next.js API Routes (Node.js)
- **Database**: Mock in-memory (ready for PostgreSQL)

## Installation

### 1. Clone & Install Dependencies

```bash
cd petuk
npm install
```

### 2. Setup Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Update with your credentials:

```env
RAZORPAY_KEY_ID=rzp_test_1IfsSGc0jFIUYJ
RAZORPAY_KEY_SECRET=jxoWK3p4hijGhLkMnOpQrS
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_1IfsSGc0jFIUYJ
ADMIN_TOKEN=admin-secret-key
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Usage

### Customer Flow

1. **Browse Menu** → Visit `/menu`
2. **Add Items to Cart** → Click "Add to Cart" on any dish
3. **View Cart** → Click cart icon in header or go to `/cart`
4. **Apply Promo** (optional) → Enter promo code like `WELCOME10`
5. **Checkout** → Click "Proceed to Checkout"
6. **Enter Details** → Name, phone, address, payment method
7. **Pay** → Razorpay or Cash on Delivery
8. **Confirmation** → View order number and tracking status

### Admin Flow

1. **Login** → Visit `/admin/orders`
2. **Enter Admin Token** → `admin-secret-key`
3. **View Orders** → See all incoming orders
4. **Update Status** → Change order status (preparing → out for delivery, etc.)
5. **Notifications** → Customer receives SMS/WhatsApp update (can be integrated)

## API Endpoints

### Public Endpoints

```
GET  /api/menu                      → Menu items with prices
GET  /api/cart                      → Retrieve server cart
POST /api/cart                      → Validate cart & calculate totals
POST /api/cart/apply-promo          → Validate and apply promo code
POST /api/orders/create             → Create order, return razorpay_order_id
POST /api/payments/verify           → Verify Razorpay payment signature
GET  /api/orders/{order_id}         → Get order status & details
```

### Admin Endpoints

```
GET  /api/admin/orders              → List all orders
POST /api/admin/orders              → Update order status
```

## Available Promo Codes (Demo)

Test these promo codes:

```
WELCOME10  → ₹50 off
SAVE20     → ₹100 off (minimum ₹300 order)
SPECIAL50  → ₹200 off
```

## Testing Razorpay (Test Mode)

### Test Payment Details

**Card Number**: `4111 1111 1111 1111`  
**Expiry**: Any future date (e.g., 12/25)  
**CVV**: Any 3 digits (e.g., 123)  
**OTP**: `123456`

### Test Razorpay Keys

The default keys in `.env.local.example` are test keys:

```
Key ID: rzp_test_1IfsSGc0jFIUYJ
Key Secret: jxoWK3p4hijGhLkMnOpQrS
```

Get your own from [Razorpay Dashboard](https://dashboard.razorpay.com/app/credentials)

## Security Features

- ✅ **Server-Side Price Verification** - No client-side price manipulation
- ✅ **Razorpay Signature Verification** - HMAC-SHA256 validation
- ✅ **Admin Token Auth** - Simple token-based admin access
- ✅ **HTTPS Ready** - Environment variables for secrets
- ✅ **Input Validation** - Quantity, amount, and form validation

## Database Integration (Future)

Currently uses in-memory mock storage. To add PostgreSQL:

### Sample Schema

```sql
-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed',
  address TEXT,
  instructions TEXT,
  payment_method VARCHAR(50),
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  razorpay_signature VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order Items table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  item_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- Promo Codes table
CREATE TABLE promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_amount DECIMAL(10,2),
  discount_percent DECIMAL(5,2),
  min_order_amount DECIMAL(10,2),
  expires_at DATE,
  max_uses INT,
  used_count INT DEFAULT 0,
  active BOOLEAN DEFAULT true
);
```

## File Structure

```
pages/
  api/
    menu.js                          → GET menu items
    cart/
      index.js                       → GET/POST cart validation
      apply-promo.js                 → POST promo validation
    orders/
      create.js                      → POST create order
      [order_id].js                  → GET order status
    payments/
      verify.js                      → POST payment verification
    admin/
      orders.js                      → GET/POST admin orders
  cart.js                            → Cart page
  checkout.js                        → Checkout flow
  order-confirmation.js              → Confirmation & tracking
  admin/
    orders.js                        → Admin dashboard

components/
  MiniCart.js                        → Header cart icon & drawer
  DishCard.js                        → Menu item card with add-to-cart

context/
  CartContext.js                     → Cart state management

data/
  menu.json                          → Menu items
  site.json                          → Site info
```

## Environment Variables

```env
# Razorpay (from dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# Frontend (public)
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_...

# Admin auth
ADMIN_TOKEN=your-secret-admin-token

# Database (optional)
DATABASE_URL=postgresql://...

# API
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Customization

### Change Tax Rate

Edit `pages/api/cart/index.js`:
```javascript
const tax = Math.round(subtotal * 0.05 * 100) / 100  // Change 0.05 to your rate
```

### Change Delivery Fee

Edit `pages/api/cart/index.js`:
```javascript
const delivery_fee = 30  // Change to your fee
```

### Add/Edit Promo Codes

Edit `pages/api/cart/apply-promo.js`:
```javascript
const promoCodes = {
  'YOUR_CODE': { discount: 100, expiresAt: '2025-12-31' }
}
```

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard.

### Other Platforms

1. Build: `npm run build`
2. Start: `npm run start`
3. Set environment variables

## Troubleshooting

### Cart not persisting

- Check browser localStorage (DevTools → Application → Storage)
- Verify `CartProvider` wraps your app in `_app.js`

### Razorpay not opening

- Check console for errors
- Verify `NEXT_PUBLIC_RAZORPAY_KEY` is set
- Confirm Razorpay script loads

### Admin orders page 403

- Use correct admin token from `.env.local`
- Default: `admin-secret-key`

### Prices not calculating correctly

- Clear browser cache & localStorage
- Ensure `/api/cart` returns correct validation
- Check menu.json prices

## SMS/WhatsApp Notifications (Optional)

To integrate SMS/WhatsApp notifications:

1. **Twilio**: Add phone notification on order confirmation
2. **AWS SNS**: Send SMS updates
3. **Notify API**: Use India-specific SMS providers

Example (Twilio):
```javascript
// In pages/api/orders/create.js or admin endpoint
const twilio = require('twilio')
const client = twilio(accountSid, authToken)

client.messages.create({
  body: `Your order ${order_id} is confirmed!`,
  from: '+1234567890',
  to: customer.phone
})
```

## Performance Tips

- Use Next.js Image component for menu items
- Implement pagination for admin orders
- Add caching headers for static assets
- Monitor Razorpay API response times

## Support

For issues or questions:
1. Check console errors (DevTools F12)
2. Verify `.env.local` setup
3. Review API responses in Network tab
4. Check Razorpay dashboard for payment status

## Next Steps

1. ✅ **Add Database** - Migrate from mock to PostgreSQL
2. ✅ **SMS Integration** - Send order updates via Twilio
3. ✅ **Inventory Management** - Track stock levels
4. ✅ **Analytics** - Track orders, popular items, revenue
5. ✅ **Email Receipts** - SendGrid integration
6. ✅ **Multiple Payment Methods** - PayPal, Google Pay, etc.

---

Built with ❤️ for Petuk Restaurant
