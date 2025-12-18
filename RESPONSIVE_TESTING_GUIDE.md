# Petuk Responsive Design - Quick Start Testing Guide

## 🎯 Quick Testing Checklist

### Visual Inspection (No Code Required)

#### Mobile View (360-480px)
```
✓ Hamburger menu visible (≤768px)
✓ Logo smaller, text on second line
✓ Navigation in dropdown menu
✓ Bottom sticky action bar with Call & Order buttons
✓ Menu items display in single column
✓ Cart items stacked vertically
✓ Forms full-width with proper padding
✓ Buttons full-width and tappable
✓ No horizontal scrolling
✓ Text readable without zooming
```

#### Tablet View (768-1024px)
```
✓ Full navigation bar visible (no hamburger)
✓ Logo and text visible side by side
✓ Menu in 2-column grid
✓ Cart in 2-column layout
✓ Forms responsive with comfortable spacing
✓ Bottom action bar hidden (desktop nav visible)
✓ All content properly sized
```

#### Desktop View (1025px+)
```
✓ Full horizontal navigation
✓ Multi-column layouts (3+ columns)
✓ Proper white space and spacing
✓ Large hero images
✓ Desktop-optimized forms
✓ Smooth hover effects
✓ Optimized readability
```

---

## 📱 Device-Specific Testing

### iPhone 12/13/14
- **Viewport**: 390x844px
- **Test**: Menu, cart, checkout, forms
- **Expected**: All functional, no overflow

### Galaxy S21/S22
- **Viewport**: 360x800px  
- **Test**: Small menu items, button sizes
- **Expected**: Touch-friendly, no truncation

### iPad / Tablet
- **Viewport**: 768x1024px
- **Test**: Two-column layouts, navigation
- **Expected**: Balanced layout, proper spacing

### Desktop / Laptop
- **Viewport**: 1366x768px+
- **Test**: Three-column grids, hover effects
- **Expected**: Professional appearance, full features

---

## 🔧 Chrome DevTools Testing

### How to Test Responsiveness

1. **Open DevTools**: `F12` or `Ctrl+Shift+I`
2. **Toggle Device Mode**: `Ctrl+Shift+M`
3. **Select Device**:
   - iPhone 12 Pro (390x844)
   - Galaxy S21 (360x800)
   - iPad (768x1024)
   - Laptop (1366x768)

### What to Check

- [ ] **No Horizontal Scroll**: Drag right on each view
- [ ] **Button Clickability**: Click all buttons, verify min 44px
- [ ] **Text Readability**: Text shouldn't require zoom
- [ ] **Images**: Properly sized, no distortion
- [ ] **Forms**: Inputs full-width, labels clear
- [ ] **Navigation**: Hamburger on mobile, full on desktop
- [ ] **Bottom Action Bar**: Visible on mobile only
- [ ] **Sticky Elements**: Header and order summary work properly

---

## 🚀 Lighthouse Performance Check

### Run Lighthouse (Chrome DevTools)

1. Open DevTools → **Lighthouse** tab
2. Select **Mobile** profile
3. Click **Analyze page load**

### Target Scores
- **Performance**: > 90
- **Accessibility**: > 90
- **Best Practices**: > 90
- **SEO**: > 90

### Common Issues to Fix
- Unused CSS (pre-check before deploy)
- Oversized images (consider lazy loading)
- Unused JavaScript (minimize scripts)

---

## 📋 Manual Testing Scenarios

### Scenario 1: Browse Menu
**Mobile**:
1. Open http://localhost:3000/menu
2. Verify hamburger menu visible
3. Click menu items, add to cart
4. Check quantities update (mobile buttons)
5. Navigate via hamburger menu

**Expected**: Single-column menu, working +/- buttons

---

### Scenario 2: Shopping Cart
**Mobile**:
1. Add items to cart
2. Open http://localhost:3000/cart
3. Verify cart items stacked vertically
4. Check order summary on side (should be sticky)
5. Modify quantities
6. Apply promo code

**Expected**: Responsive layout, working buttons, no overflow

---

### Scenario 3: Checkout
**Mobile**:
1. Proceed to checkout
2. Fill form fields (full-width inputs)
3. Select payment method
4. Click "Pay & Order" button
5. Verify form submission

**Expected**: Form fields properly sized, buttons tappable, no layout shift

---

### Scenario 4: Make Reservation
**Mobile**:
1. Open http://localhost:3000/reserve
2. Scroll form (should be centered)
3. Fill all fields
4. Submit reservation

**Expected**: Centered form, proper spacing, readable inputs

---

### Scenario 5: Navigation
**Mobile**:
1. Tap hamburger menu icon
2. Verify menu slides down
3. Tap menu items
4. Verify page navigates
5. Verify menu closes on navigation

**Expected**: Smooth animation, no glitches, proper closing

---

### Scenario 6: Bottom Action Bar (Mobile Only)
**Mobile**:
1. Scroll to bottom of any page
2. Verify "Call" and "Order" buttons visible
3. Click "Call" (should dial)
4. Click "Order" (should go to menu)

**Expected**: Buttons always visible, not obscuring content

---

## 🎨 Design Consistency Check

### Colors (Should match Petuk branding)
- [ ] Orange buttons: `#FF7A00`
- [ ] Dark background: `#1a1a1a`
- [ ] Charcoal cards: `#222222`
- [ ] Offwhite text: `#F2F2F2`

### Typography
- [ ] Headings: Bold, orange color
- [ ] Body text: Readable, 14px+ on mobile
- [ ] Small text: Clear, not too tiny
- [ ] Links: Orange, understandable

### Spacing
- [ ] Mobile padding: 1rem (16px)
- [ ] Tablet padding: 1.5rem (24px)
- [ ] Desktop padding: 2rem (32px)
- [ ] Gap between items: Consistent

### Buttons
- [ ] Minimum 44x44px touch target
- [ ] Orange color with hover state
- [ ] Proper margin/padding
- [ ] Clear text, readable font size

---

## 🐛 Common Issues & Fixes

### Issue: Hamburger Menu Not Closing
**Fix**: Check Header.js line that closes menu on link click
```javascript
onClick={() => setMenuOpen(false)}
```

### Issue: Bottom Action Bar Covers Content
**Fix**: Check reserve.js for spacer div:
```javascript
<div className="h-20 md:hidden"></div>
```

### Issue: Sticky Order Summary Misaligned
**Fix**: Verify sticky top value matches header height:
```javascript
sticky top-24 md:top-20
```

### Issue: Inputs Too Small on Mobile
**Fix**: Ensure py-3 is applied to inputs (44px minimum):
```javascript
py-3 md:py-2
```

### Issue: Text Overlapping on Mobile
**Fix**: Check for text-wrap or word-break classes:
```javascript
break-words // For text that needs to wrap
```

---

## ✅ Final Deployment Checklist

Before going live:

- [ ] All pages tested on mobile (360px+)
- [ ] All pages tested on tablet (768px+)
- [ ] All pages tested on desktop (1366px+)
- [ ] No horizontal scrolling on any device
- [ ] Hamburger menu works smoothly
- [ ] Bottom action bar not covering content
- [ ] All buttons are tappable (44x44px min)
- [ ] Forms submit properly on mobile
- [ ] Images load and scale correctly
- [ ] Text is readable without zooming
- [ ] Lighthouse mobile score > 90
- [ ] No console errors in DevTools
- [ ] Links work on all pages
- [ ] Navigation flows smoothly
- [ ] Spelling and grammar checked

---

## 📞 Troubleshooting

### DevTools says "No device selected"
→ Click "Edit" in device selector, make sure device is checked

### Responsive view looks broken
→ Try refreshing page: `Ctrl+Shift+R` (hard refresh)

### Changes not showing
→ Check browser cache: DevTools → Settings → Disable cache (when DevTools open)

### Hamburger menu won't open
→ Check browser console for JavaScript errors: `F12` → Console

### Bottom action bar missing on mobile
→ Check screen width is < 768px (use DevTools device mode)

---

**Remember**: Always test on actual devices when possible. Browser DevTools is helpful, but real device testing is essential for catching responsive design issues.

**Last Updated**: December 15, 2025
