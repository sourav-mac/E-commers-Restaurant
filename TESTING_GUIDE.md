# Shopping Cart - Testing Guide

## Quick Start Checklist

- [ ] Install dependencies: `npm install`
- [ ] Set up `.env.local` (done)
- [ ] Run dev server: `npm run dev`
- [ ] Clear browser cache/localStorage
- [ ] Test on mobile (DevTools mobile view)

## Test Scenarios

### 1. Add Items to Cart

**Steps**:
1. Go to `http://localhost:3000`
2. Scroll to "Popular dishes" section
3. Click "Add to Cart" on Chicken Lollipop
4. Select quantity (1, 2, 3...)
5. Click "Add" button

**Expected**:
- Item added to cart
- Cart count badge shows in header
- Mini-cart updates with item

### 2. Cart Persistence (localStorage)

**Steps**:
1. Add 2-3 items to cart
2. Go to `/cart` page
3. Refresh page (F5)
4. Close browser & reopen

**Expected**:
- Items still in cart after refresh
- localStorage shows `petuk_cart` key
- Totals recalculate correctly

### 3. Quantity Controls

**Steps**:
1. Go to `/cart`
2. Click `+` and `−` buttons on an item
3. Remove item completely (qty = 0)

**Expected**:
- Item qty updates
- Total price recalculates
- Item removed when qty = 0
- Subtotal, tax, delivery all update

### 4. Promo Code Validation

**Test codes** (all valid on orders > ₹0):
- `WELCOME10` → ₹50 off
- `SAVE20` → ₹100 off (min ₹300 order)
- `SPECIAL50` → ₹200 off

**Steps**:
1. Go to `/cart`
2. Add 3+ items (total ≥ ₹300)
3. Enter promo code `SAVE20`
4. Click "Apply"

**Expected**:
- Discount applied to total
- Success message shown
- Green badge shows applied code

**Test invalid code**:
1. Enter `INVALID123`
2. Click "Apply"

**Expected**:
- Error message: "Promo code not found"

### 5. Checkout Flow - Cash on Delivery (COD)

**Steps**:
1. Go to `/cart` with items
2. Click "Proceed to Checkout"
3. Fill form:
   - Name: "Test Customer"
   - Phone: "09647497019"
   - Email: (leave empty)
4. Select "Cash on Delivery"
5. Click "Pay ₹XXX - অর্ডার করুন"

**Expected**:
- Order created immediately
- Redirect to `/order-confirmation?order_id=PETUK-...`
- Show order number, status, items
- Cart cleared (localStorage wiped)
- Order status: "Order Confirmed"

### 6. Checkout Flow - Razorpay Payment

**Steps**:
1. Go to `/cart` with items
2. Click "Proceed to Checkout"
3. Fill form:
   - Name: "Test Razorpay"
   - Phone: "09876543210"
   - Email: "test@example.com"
4. Select "Credit/Debit Card, UPI, or Wallet"
5. Enter delivery address: "Test Address, City"
6. Click "Pay ₹XXX"

**Razorpay Modal Should Open**:
- Pay with email/phone
- See amount in INR

**Test Payment (Use Test Card)**:
1. Click "Pay" in Razorpay modal
2. Card: `4111 1111 1111 1111`
3. Expiry: `12/25` (or any future date)
4. CVV: `123`
5. OTP: `123456`

**Expected**:
- Payment successful message
- Redirect to order confirmation
- Order status: "Order Confirmed"
- Razorpay order ID stored

### 7. Order Tracking

**Steps**:
1. Complete an order (any payment method)
2. View order confirmation page
3. Check status timeline

**Expected**:
- Order number displayed (PETUK-YYYYMMDD-xxx)
- Current status highlighted (✓)
- Next steps shown
- Customer phone & address visible

### 8. Admin Orders Dashboard

**Login to Admin**:
1. Go to `http://localhost:3000/admin/orders`
2. Password: `admin-secret-key`
3. Click "Login"

**View Orders**:
- See all orders created
- Order ID, customer, amount, status
- Items listed for each order

**Update Order Status**:
1. Select new status from dropdown (e.g., "preparing")
2. Status updates immediately
3. In production, customer receives SMS/WhatsApp

### 9. Mobile Responsiveness

**Test on Mobile** (use DevTools):
1. Press F12 → DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone 12 or Android

**Check**:
- ✓ Cart drawer slides from right (not desktop version)
- ✓ All buttons clickable
- ✓ Input fields visible
- ✓ No horizontal scroll
- ✓ Touch-friendly button sizes (min 44px)

### 10. Edge Cases

#### Empty Cart
1. Don't add any items
2. Try to visit `/checkout`

**Expected**: Redirect to `/cart`, show empty state

#### Refresh During Checkout
1. Go to `/checkout`
2. Refresh page (F5)

**Expected**: Page reloads correctly, form data preserved (if localStorage used)

#### Same Item Multiple Times
1. Add "Chicken Lollipop" qty=1
2. Add "Chicken Lollipop" again qty=2

**Expected**: Quantities combine (qty=3 total, not 2 separate items)

#### Large Quantities
1. Try to add qty=101

**Expected**: Capped at 100 (validation on server)

#### Network Errors
1. In DevTools, throttle network (DevTools → Network → Slow 3G)
2. Try to apply promo
3. Try to create order

**Expected**: Loading state shown, appropriate error messages

## Common Issues & Fixes

### Issue: Cart empties on refresh
**Fix**: Check localStorage in DevTools → Application → Storage → LocalStorage

### Issue: Razorpay modal doesn't open
**Fix**: 
- Check console for errors (F12)
- Verify NEXT_PUBLIC_RAZORPAY_KEY in `.env.local`
- Check network tab for Razorpay script load

### Issue: Order not created
**Fix**:
- Check `/api/orders/create` response in Network tab
- Verify phone/name fields filled
- Check browser console for errors

### Issue: Admin page shows 401
**Fix**:
- Admin token in URL header might be wrong
- Use: `admin-secret-key`
- Check network request Authorization header

## Performance Testing

### Load Test Menu
```javascript
// In browser console
fetch('/api/menu')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Check Cart Calculation
1. Add items
2. Open DevTools → Network
3. Go to `/cart`
4. Check POST /api/cart response
5. Verify prices match menu.json

## Database Migration (When Ready)

When adding PostgreSQL:

1. Update `pages/api/cart/index.js` to use DB
2. Update `pages/api/orders/create.js` to save orders
3. Update `pages/api/admin/orders.js` to query DB
4. Run migrations: `psql petuk_db < schema.sql`

## Checklist for Production

- [ ] Change Razorpay keys to live keys
- [ ] Update ADMIN_TOKEN to secure value
- [ ] Add rate limiting to checkout endpoint
- [ ] Set up SMS/WhatsApp notifications
- [ ] Enable HTTPS
- [ ] Set up proper database (PostgreSQL)
- [ ] Add logging & error tracking
- [ ] Load test with ab or wrk
- [ ] Test on multiple browsers
- [ ] Test on iOS & Android devices

## Notes

- Test keys allow unlimited test payments
- Test card `4111...` always succeeds
- All orders in test mode are recoverable
- Switch to live keys in production (`rzp_live_...`)
- Never commit live credentials to Git!

---

Happy testing! 🚀
