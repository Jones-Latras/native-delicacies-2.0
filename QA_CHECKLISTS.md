# QA Testing Checklists

## Mobile Responsiveness (10.3)

Test on each device/viewport:
- [ ] iPhone SE (375px)
- [ ] iPhone 14 (390px)
- [ ] Samsung Galaxy S21 (360px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] Desktop (1280px, 1440px, 1920px)

### Page-by-Page Checks

**Homepage:**
- [ ] Hero section text readable, buttons tappable
- [ ] Category cards grid responsive (2-col mobile → 5-col desktop)
- [ ] Featured products grid responsive
- [ ] Heritage section stacks vertically on mobile
- [ ] Gift CTA section responsive

**Menu Page:**
- [ ] Filter bar collapses properly on mobile
- [ ] Product cards stack in grid (1-2 col mobile → 3-4 col desktop)
- [ ] Pagination works on mobile
- [ ] Search input usable on mobile keyboard

**Bilao Builder:**
- [ ] Step-by-step flow works on mobile
- [ ] Item selection cards tappable (44px+ touch targets)
- [ ] Running total visible
- [ ] Add to cart button accessible

**Cart Page:**
- [ ] Cart items display properly on narrow screens
- [ ] Quantity controls tappable
- [ ] Price summary visible
- [ ] Checkout button fixed at bottom on mobile

**Checkout:**
- [ ] Form fields full-width on mobile
- [ ] Address form usable on mobile keyboard
- [ ] Payment section responsive
- [ ] Order summary collapsible on mobile

**Order Tracking:**
- [ ] Status timeline vertical on mobile
- [ ] Order details readable
- [ ] Track by order number works

**Auth Pages:**
- [ ] Login form centered and accessible
- [ ] Register form fields visible
- [ ] Social login buttons full-width

**Admin Dashboard (tablet+):**
- [ ] Sidebar collapses to mobile nav
- [ ] Tables horizontally scrollable
- [ ] Forms usable on tablet
- [ ] Charts/stats cards stack properly

**General:**
- [ ] All buttons minimum 44px touch target
- [ ] No horizontal scroll on any page
- [ ] Text readable without zooming (min 16px body text)
- [ ] Navigation menu works on mobile (hamburger/drawer)
- [ ] Footer stacks properly on mobile
- [ ] Modals/dropdowns usable on mobile

---

## Cross-Browser Testing (10.4)

Test on latest 2 versions of:
- [ ] Chrome (Desktop + Android)
- [ ] Safari (Desktop macOS + iOS)
- [ ] Firefox (Desktop)
- [ ] Edge (Desktop)

### Critical Paths per Browser

- [ ] Homepage loads, images render, fonts load
- [ ] Menu browsing with filter/search
- [ ] Add items to cart
- [ ] Checkout with Stripe payment form
- [ ] Order tracking page
- [ ] Login/Register forms
- [ ] Admin dashboard (Chrome/Edge sufficient)
- [ ] PWA install prompt (Chrome, Edge, Safari)
- [ ] Service worker caching/offline page

### Known Browser Considerations

- Safari: Check `backdrop-filter`, CSS `gap` in flex, date input format
- Firefox: Check custom scrollbar styles, form autofill styling
- iOS Safari: Check fixed positioning, viewport height (`dvh`), rubber-band scrolling
- Edge: Generally matches Chrome — spot-check only

---

## End-to-End Test Scenarios (10.5)

### Customer Journeys

1. **New Customer Browse & Buy:**
   - [ ] Browse homepage → click category → view items
   - [ ] Click item → see details → add to cart
   - [ ] Go to cart → adjust quantity → proceed to checkout
   - [ ] Register new account during checkout
   - [ ] Fill delivery info → select payment → complete order
   - [ ] Receive confirmation email
   - [ ] Track order with order number

2. **Returning Customer:**
   - [ ] Login with existing account
   - [ ] Browse menu with search
   - [ ] Add items to cart
   - [ ] Checkout with saved address
   - [ ] Apply promo code `WELCOME10`
   - [ ] Pay with card (Stripe test mode: `4242 4242 4242 4242`)
   - [ ] View order in profile → orders

3. **Bilao Builder Flow:**
   - [ ] Navigate to Bilao Builder
   - [ ] Select tray size
   - [ ] Add items to bilao
   - [ ] Review and add to cart
   - [ ] Proceed through checkout

4. **Gift Order:**
   - [ ] Add items to cart
   - [ ] At checkout, enable "This is a gift"
   - [ ] Add gift message
   - [ ] Complete order with different delivery address

5. **Schedule-for-Later:**
   - [ ] At checkout, select schedule time
   - [ ] Complete order
   - [ ] Verify scheduled time in order confirmation

6. **Guest Checkout:**
   - [ ] Add items to cart without logging in
   - [ ] Proceed to checkout as guest
   - [ ] Enter all info manually
   - [ ] Complete order
   - [ ] Track with order number (no profile)

7. **Order Cancellation:**
   - [ ] Place an order
   - [ ] Go to order tracking
   - [ ] Cancel order (if status allows)
   - [ ] Verify cancellation email

### Admin Journeys

8. **Order Management:**
   - [ ] Login as admin
   - [ ] View new orders on dashboard
   - [ ] Click order → update status: CONFIRMED → PREPARING → READY → COMPLETED
   - [ ] Verify customer receives status update email

9. **Menu Management:**
   - [ ] Add new menu item with image
   - [ ] Edit existing item (price, description)
   - [ ] Toggle availability
   - [ ] Delete an item
   - [ ] Add/edit item options

10. **Settings Management:**
    - [ ] Update business hours
    - [ ] Change delivery zones/fees
    - [ ] Update tax rate
    - [ ] Toggle accepting orders
    - [ ] Update announcement banner
    - [ ] Verify changes reflect on storefront

### Error/Edge Cases

11. **Payment Failures:**
    - [ ] Card declined: use `4000 0000 0000 0002`
    - [ ] Insufficient funds: use `4000 0000 0000 9995`
    - [ ] Verify error message displayed to user
    - [ ] Order not created on payment failure

12. **Business Closed:**
    - [ ] Set business as not accepting orders
    - [ ] Verify storefront shows closed status
    - [ ] Verify checkout is blocked

13. **Rate Limiting:**
    - [ ] Rapidly submit login form → should get 429 after 5 attempts
    - [ ] Rapidly submit registration → should get 429

14. **Concurrent Daily Limits:**
    - [ ] Set daily limit on an item
    - [ ] Place orders until limit reached
    - [ ] Verify item shows as unavailable

---

## Soft Launch Checklist (10.10)

- [ ] Deploy to production (Vercel)
- [ ] Verify all environment variables set
- [ ] Run database migration on production
- [ ] Seed production data (admin user, categories)
- [ ] Add real menu items via admin dashboard
- [ ] Test Stripe live payment (small amount, refund after)
- [ ] Test email delivery (registration + order confirmation)
- [ ] Test all pages load without errors
- [ ] Check browser console for JavaScript errors
- [ ] Verify security headers (securityheaders.com)
- [ ] Run Lighthouse audit (target >90 performance)
- [ ] Internal team places 3-5 test orders
- [ ] Admin processes test orders through all statuses
- [ ] Train staff on admin dashboard usage
- [ ] Set up uptime monitoring

---

## Go Live Checklist (10.11)

- [ ] All soft launch issues resolved
- [ ] Enable "Accepting Orders" in admin settings
- [ ] Enable announcement banner with launch message
- [ ] Monitor first 10 real orders closely
- [ ] Watch error logs for any new issues
- [ ] Verify Stripe payments are processing
- [ ] Verify emails are delivering
- [ ] Check server performance / response times
- [ ] Be ready to disable orders if critical issues found
- [ ] Gather initial customer feedback
- [ ] Celebrate! 🎉
