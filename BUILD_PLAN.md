# Filipino Native Delicacies Online Platform — Step-by-Step Build Plan

> **Document Version:** 1.0
> **Created:** March 13, 2026
> **Total Estimated Phases:** 10 phases across 7 milestones
> **Tech Stack:** Next.js (App Router) · TypeScript · PostgreSQL · Prisma ORM · Stripe · Tailwind CSS · NextAuth.js · Zustand · Socket.IO

---

## Table of Contents

1. [Phase 1 — Project Scaffolding & Dev Environment](#phase-1--project-scaffolding--dev-environment)
2. [Phase 2 — Database Design & Backend Foundation](#phase-2--database-design--backend-foundation)
3. [Phase 3 — Authentication System](#phase-3--authentication-system)
4. [Phase 4 — Menu Display & Product Catalog](#phase-4--menu-display--product-catalog)
5. [Phase 5 — Shopping Cart & Bilao Builder](#phase-5--shopping-cart--bilao-builder)
6. [Phase 6 — Checkout & Payment Integration](#phase-6--checkout--payment-integration)
7. [Phase 7 — Order Placement & Tracking](#phase-7--order-placement--tracking)
8. [Phase 8 — Admin Dashboard & Management](#phase-8--admin-dashboard--management)
9. [Phase 9 — Notifications, Policies & Content Pages](#phase-9--notifications-policies--content-pages)
10. [Phase 10 — Testing, Optimization & Launch](#phase-10--testing-optimization--launch)

---

## Tech Stack Decision Summary

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | **Next.js 14+ (App Router)** | SSR/SSG, API routes, file-based routing, image optimization |
| Language | **TypeScript** | Type safety across frontend & backend |
| Styling | **Tailwind CSS** | Rapid UI development, mobile-first, custom theme support |
| Database | **PostgreSQL** | Relational data model fits the domain; robust, free |
| ORM | **Prisma** | Type-safe queries, migrations, seeding |
| Auth | **NextAuth.js (Auth.js v5)** | Credentials + guest checkout, JWT sessions |
| State (client) | **Zustand** | Lightweight cart/state management, persists to localStorage |
| Payments | **Stripe (Elements + Webhooks)** | PCI-compliant, card payments, refunds |
| Real-time | **Socket.IO** or **Pusher** | Live order status updates for customers & admin |
| Email | **Resend** or **SendGrid** | Transactional emails (confirmations, status updates) |
| File Storage | **Cloudinary** or **Vercel Blob** | Menu item images, logo, hero banners |
| Hosting | **Vercel** | Zero-config Next.js deployment, edge functions, CDN |
| Database Host | **Neon** or **Supabase (Postgres)** | Serverless Postgres, free tier for MVP |

---

## Phase 1 — Project Scaffolding & Dev Environment

**Goal:** Get the project skeleton running locally with all tooling configured.

### Steps:

- [ ] **1.1 — Initialize Next.js project**
  ```
  npx create-next-app@latest delicacies-2 --typescript --tailwind --eslint --app --src-dir
  ```

- [ ] **1.2 — Install core dependencies**
  ```
  npm install prisma @prisma/client next-auth @auth/prisma-adapter
  npm install zustand stripe @stripe/stripe-js @stripe/react-stripe-js
  npm install zod react-hook-form @hookform/resolvers
  npm install lucide-react clsx tailwind-merge
  npm install resend socket.io socket.io-client
  npm install -D prisma @types/node
  ```

- [ ] **1.3 — Set up project folder structure**
  ```
  src/
  ├── app/
  │   ├── (storefront)/          # Customer-facing routes
  │   │   ├── page.tsx           # Homepage
  │   │   ├── menu/
  │   │   ├── cart/
  │   │   ├── checkout/
  │   │   ├── order/[id]/
  │   │   ├── track/[orderNumber]/
  │   │   ├── bilao-builder/
  │   │   ├── about/
  │   │   ├── contact/
  │   │   └── policies/
  │   ├── (auth)/
  │   │   ├── login/
  │   │   ├── register/
  │   │   └── forgot-password/
  │   ├── admin/                 # Admin dashboard routes
  │   │   ├── page.tsx           # Dashboard overview
  │   │   ├── orders/
  │   │   ├── menu/
  │   │   ├── customers/
  │   │   ├── promotions/
  │   │   ├── reports/
  │   │   ├── settings/
  │   │   └── content/
  │   ├── api/
  │   │   ├── auth/
  │   │   ├── menu/
  │   │   ├── orders/
  │   │   ├── cart/
  │   │   ├── checkout/
  │   │   ├── stripe/
  │   │   ├── admin/
  │   │   └── upload/
  │   ├── layout.tsx
  │   └── globals.css
  ├── components/
  │   ├── ui/                    # Reusable UI primitives
  │   ├── storefront/            # Customer-facing components
  │   ├── admin/                 # Admin components
  │   └── shared/                # Shared between both
  ├── lib/
  │   ├── prisma.ts              # Prisma client singleton
  │   ├── auth.ts                # NextAuth config
  │   ├── stripe.ts              # Stripe server config
  │   ├── email.ts               # Email helper
  │   ├── utils.ts               # General utilities
  │   └── validators/            # Zod schemas
  ├── stores/
  │   ├── cart-store.ts          # Zustand cart store
  │   └── ui-store.ts            # UI state (modals, sidebars)
  ├── types/
  │   └── index.ts               # Shared TypeScript types
  └── middleware.ts              # Auth + admin route protection
  ```

- [ ] **1.4 — Configure Tailwind CSS with Filipino heritage theme**
  - Define custom color palette (warm wood tones, earthy heritage colors)
  - Set up custom fonts (clean modern serif + sans-serif pairing)
  - Configure spacing, border-radius, and shadow tokens for premium feel

- [ ] **1.5 — Set up environment variables file**
  ```env
  # .env.local
  DATABASE_URL=
  NEXTAUTH_SECRET=
  NEXTAUTH_URL=http://localhost:3000
  STRIPE_SECRET_KEY=
  STRIPE_PUBLISHABLE_KEY=
  STRIPE_WEBHOOK_SECRET=
  RESEND_API_KEY=
  CLOUDINARY_URL=
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```

- [ ] **1.6 — Create shared UI components**
  - Button, Input, Select, Textarea, Badge, Card, Modal, Toast/Notification
  - Loading skeletons
  - Responsive navbar shell and footer shell

- [ ] **1.7 — Set up ESLint, Prettier, and commit hooks**

### Deliverable: Running `npm run dev` shows a styled placeholder homepage with navbar and footer.

---

## Phase 2 — Database Design & Backend Foundation

**Goal:** Full database schema, migrations, seed data, and core API utilities.

### Steps:

- [ ] **2.1 — Initialize Prisma and connect to PostgreSQL**
  ```
  npx prisma init
  ```
  Configure `DATABASE_URL` pointing to local or hosted Postgres.

- [ ] **2.2 — Define complete Prisma schema**

  **Models to create:**

  | Model | Key Fields |
  |-------|-----------|
  | `User` | id, email, passwordHash, name, phone, role (CUSTOMER/ADMIN/MANAGER/STAFF), emailVerified, createdAt |
  | `Address` | id, userId, label, street, city, state, postalCode, deliveryInstructions, isDefault |
  | `Category` | id, name, slug, displayOrder, isVisible, availabilityStart, availabilityEnd, imageUrl |
  | `MenuItem` | id, name, slug, description, categoryId, price, imageUrl, isAvailable, originRegion, shelfLifeDays, storageInstructions, heritageStory, dietaryTags[], preparationMinutes, ingredients, allergenInfo, dailyLimit, createdAt, updatedAt |
  | `MenuItemOption` | id, menuItemId, optionGroup, name, priceModifier, isRequired, displayOrder |
  | `Order` | id, orderNumber, userId?, customerName, customerEmail, customerPhone, orderType, status, deliveryAddress (JSON), pickupTime, scheduledTime, subtotal, deliveryFee, tax, tip, total, paymentMethod, paymentStatus, stripePaymentIntentId, isGift, giftMessage, specialInstructions, createdAt, estimatedReadyTime |
  | `OrderItem` | id, orderId, menuItemId, quantity, priceAtOrder, customizations (JSON), specialInstructions |
  | `OrderStatusHistory` | id, orderId, status, changedBy, note, createdAt |
  | `BusinessSettings` | id (singleton), businessName, phone, email, address (JSON), operatingHours (JSON), deliveryZones (JSON), deliveryFee, minimumOrder, isAcceptingOrders, taxRate, timezone, heroImageUrl, aboutText |
  | `PromoCode` | id, code, discountType, discountValue, minOrderAmount, maxDiscount, expiryDate, isActive, usageLimit, usedCount, applicableTo (JSON) |
  | `PromoRedemption` | id, promoCodeId, orderId, userId?, discountApplied, createdAt |
  | `ActivityLog` | id, userId, action, details (JSON), ipAddress, createdAt |

- [ ] **2.3 — Run initial migration**
  ```
  npx prisma migrate dev --name init
  ```

- [ ] **2.4 — Create seed script** (`prisma/seed.ts`)
  - Default admin user (owner role)
  - Sample categories: Kakanin, Pastries, Biscuits, Sweets, Pasalubong Bundles
  - Sample menu items with heritage stories, dietary tags, images
  - Default business settings (hours, delivery zones, tax rate)

- [ ] **2.5 — Create Prisma client singleton** (`src/lib/prisma.ts`)

- [ ] **2.6 — Build core API utilities**
  - Response helpers (success, error, paginated)
  - Zod validation middleware
  - Rate limiting utility (in-memory for MVP, Redis later)
  - Error handling wrapper for API routes
  - Auth guards (requireAuth, requireAdmin, requireRole)

- [ ] **2.7 — Create Zod validation schemas** (`src/lib/validators/`)
  - `menu.ts` — item creation/update schemas
  - `order.ts` — order placement schema
  - `auth.ts` — login, register, profile update schemas
  - `checkout.ts` — checkout data schema
  - `admin.ts` — settings, promo code schemas

### Deliverable: `npx prisma studio` shows all tables; seed data populates correctly; API utility functions tested.

---

## Phase 3 — Authentication System

**Goal:** Customer registration, login, guest checkout flow, and admin login.

### Steps:

- [ ] **3.1 — Configure NextAuth.js**
  - Credentials provider (email + password)
  - JWT strategy with role in token
  - Custom sign-in/sign-up pages
  - Session callback to include userId and role

- [ ] **3.2 — Build registration API** (`POST /api/auth/register`)
  - Validate with Zod (email, password strength, name, phone)
  - Hash password with bcrypt
  - Create user in database
  - Send welcome email (via Resend)
  - Return session token

- [ ] **3.3 — Build login page** (`/login`)
  - Email + password form
  - "Remember me" option
  - Link to register page
  - Link to forgot password
  - Redirect to previous page after login

- [ ] **3.4 — Build registration page** (`/register`)
  - Name, email, phone, password, confirm password
  - Password strength indicator
  - Terms acceptance checkbox
  - Post-registration redirect

- [ ] **3.5 — Build forgot password flow**
  - Request reset: email input → send reset link via email
  - Reset page: token validation → new password form
  - API routes: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`

- [ ] **3.6 — Build user profile page** (`/profile`)
  - Edit name, phone, email
  - Manage saved addresses (add/edit/delete, set default)
  - View order history (links to order detail pages)
  - Change password
  - Notification preferences

- [ ] **3.7 — Implement middleware route protection** (`src/middleware.ts`)
  - Protect `/admin/*` routes — require ADMIN/MANAGER/STAFF role
  - Protect `/profile` — require authenticated user
  - Allow all storefront routes for guests
  - Redirect unauthenticated admin access to `/admin/login`

- [ ] **3.8 — Build admin login page** (`/admin/login`)
  - Separate branded login page for admin portal
  - IP restriction check (optional, via environment config)
  - Log login attempts to ActivityLog

- [ ] **3.9 — Implement session timeout (30 min inactivity for admin)**

### Deliverable: Users can register, log in, reset password, manage profile. Admin login is separate and protected. Guest users can browse freely.

---

## Phase 4 — Menu Display & Product Catalog

**Goal:** Full menu browsing experience — homepage, category navigation, item details, search, and filtering.

### Steps:

- [ ] **4.1 — Build menu API routes**
  - `GET /api/menu/categories` — all visible categories (ordered)
  - `GET /api/menu/items` — paginated, filterable (category, region, dietary, search query, availability)
  - `GET /api/menu/items/[slug]` — single item with options and heritage story
  - `GET /api/menu/featured` — featured/popular items
  - `GET /api/menu/bundles` — pasalubong gift bundles

- [ ] **4.2 — Build the Homepage**
  > 📌 **PROVIDE YOUR EXISTING HOME PAGE CODE HERE** — I will integrate it with the backend data fetching and ensure it connects to live menu data, business hours, and featured items.

  **Homepage sections to wire up:**
  - Hero section with CTA → links to `/menu`
  - Business hours display → pulled from `BusinessSettings`
  - Open/Closed status indicator → computed from operating hours
  - Featured items carousel → from `/api/menu/featured`
  - "Pasalubong & Gift Bundles" spotlight
  - Category quick-links
  - About us preview
  - Footer with contact info, socials, policy links

- [ ] **4.3 — Build the Menu page** (`/menu`)
  - Sticky category navigation bar (horizontal scroll on mobile)
  - Grid layout of menu items (responsive: 1 col mobile, 2 tablet, 3-4 desktop)
  - Each item card shows: image, name, price, origin region badge, dietary icons, availability
  - Quick "Add to Cart" button on card (default size, qty 1)
  - Smooth scroll to category sections
  - "Sold Out" overlay for unavailable items

- [ ] **4.4 — Build search and filter bar**
  - Text search (debounced, searches name + description)
  - Filter by region (Luzon, Visayas, Mindanao)
  - Filter by dietary tags (vegetarian, vegan, gluten-free)
  - Sort by: Popular, Price (low-high, high-low), Name (A-Z)
  - Clear all filters button

- [ ] **4.5 — Build Item Detail modal/page** (`/menu/[slug]`)
  - Large hero image (with gallery if multiple images)
  - Name, price, origin region, dietary badges
  - Full description
  - **Heritage Story** section (collapsible, with cultural context)
  - Ingredients & allergen information
  - Shelf life & storage instructions
  - **Customization panel:**
    - Size selector (with price modifiers)
    - Add-ons checklist (with prices)
    - Modifications checklist
    - Quantity selector
    - Special instructions textarea
  - "Add to Cart" button (with running total based on selections)
  - "Back to Menu" link

- [ ] **4.6 — Build "Popular / Chef's Recommendations" section**
  - Horizontal scrollable row or dedicated section on menu page
  - Based on order frequency (or manually flagged by admin)

- [ ] **4.7 — Implement image optimization**
  - Use Next.js `<Image>` component throughout
  - Cloudinary transformations for responsive sizes
  - Blur placeholder while loading
  - Lazy loading for off-screen images

- [ ] **4.8 — Implement business hours logic**
  - Utility function: `isCurrentlyOpen(operatingHours, timezone)`
  - Show "Currently Closed — Opens at [time]" banner when closed
  - Disable "Order Now" when closed (allow schedule-for-later only)
  - Display today's hours prominently

### Deliverable: Customers can browse the full menu, search/filter, view detailed item pages with heritage stories, and see real-time open/closed status.

---

## Phase 5 — Shopping Cart & Bilao Builder

**Goal:** Full cart functionality with customizations, plus the custom Bilao Builder feature.

### Steps:

- [ ] **5.1 — Build Zustand cart store** (`src/stores/cart-store.ts`)
  - State: cart items array, each with: menuItemId, name, price, quantity, size, addOns[], modifications[], specialInstructions, imageUrl, lineTotal
  - Actions: addItem, removeItem, updateQuantity, updateCustomizations, clearCart, applyPromoCode, removePromoCode
  - Computed: subtotal, itemCount, deliveryFee, tax, total
  - **Persist to localStorage** for guest users (via Zustand persist middleware)
  - Sync to server for logged-in users (via API)

- [ ] **5.2 — Build cart API for logged-in users**
  - `GET /api/cart` — fetch saved cart
  - `POST /api/cart` — save/sync cart
  - `DELETE /api/cart` — clear cart
  - Merge guest cart with server cart on login

- [ ] **5.3 — Build the Shopping Cart UI**
  > 📌 **PROVIDE YOUR EXISTING SHOPPING CART CODE HERE** — I will connect it to the Zustand store, wire up the API sync for logged-in users, and ensure all customization editing works.

  **Cart features to wire up:**
  - Slide-out cart panel (accessible from any page via navbar icon)
  - Full cart page (`/cart`) as alternative
  - Each item shows: image, name, size, add-ons, modifications, special instructions, quantity, line total
  - Edit quantity (increment/decrement, direct input)
  - Edit customizations (reopen customization modal)
  - Remove item (with confirmation)
  - Promo code input field with apply/remove
  - Price breakdown: subtotal, delivery fee, tax, promo discount, total
  - Minimum order validation with message
  - Estimated preparation time
  - "Continue Shopping" and "Proceed to Checkout" buttons
  - Empty cart state with CTA to browse menu
  - Cart badge on navbar showing item count

- [ ] **5.4 — Build the Bilao Builder page** (`/bilao-builder`)
  > 📌 **PROVIDE YOUR EXISTING BILAO BUILDER CODE HERE** — I will integrate it with the menu item data from the database and connect the "Add Bilao to Cart" action to the Zustand cart store.

  **Bilao Builder features to wire up:**
  - Select bilao size (small, medium, large) with price
  - Display available kakanin items to fill the bilao
  - Visual representation of bilao being filled
  - Min/max item count per size
  - Running total as items are added
  - "Add to Cart" — adds the complete bilao as a single cart item with all selected contents as customizations

- [ ] **5.5 — Implement cart persistence and cross-tab sync**
  - localStorage listener for cross-tab updates
  - Cart merge logic when guest logs in

- [ ] **5.6 — Implement promo code validation**
  - `POST /api/promo/validate` — check code validity, return discount info
  - Client-side display of applied discount
  - Re-validate at checkout

### Deliverable: Fully functional cart with real-time updates, customization editing, promo codes, and the unique Bilao Builder experience.

---

## Phase 6 — Checkout & Payment Integration

**Goal:** Complete checkout flow with delivery/pickup options, Stripe payment, and cash options.

### Steps:

- [ ] **6.1 — Build checkout page** (`/checkout`)
  - Single-page checkout layout with sections:
    1. Order Type (Delivery / Pickup toggle)
    2. Contact Information (name, email, phone)
    3. Delivery Address (if delivery) or Pickup Time (if pickup)
    4. Order Timing (ASAP / Schedule for later)
    5. Gift Options (toggle "This is a gift" + message field)
    6. Special Instructions
    7. Payment Method selection
    8. Order Summary (read-only cart recap)
    9. Place Order button
  - Pre-fill fields for logged-in users
  - Address autocomplete (Google Places API or manual entry)
  - Save address checkbox (for logged-in users)
  - Date/time picker for scheduled orders
  - Validate delivery address is within delivery zones

- [ ] **6.2 — Set up Stripe server-side** (`src/lib/stripe.ts`)
  - Initialize Stripe with secret key
  - Create Payment Intent endpoint: `POST /api/stripe/create-payment-intent`
    - Calculate final total server-side (never trust client total)
    - Include metadata: orderId, customerEmail
  - Webhook handler: `POST /api/stripe/webhook`
    - Handle `payment_intent.succeeded`
    - Handle `payment_intent.payment_failed`
    - Update order payment status in database
    - Trigger confirmation email

- [ ] **6.3 — Build Stripe Elements payment form**
  - Card number, expiry, CVC (Stripe Elements)
  - 3D Secure handling (automatic via Stripe)
  - Loading state during processing
  - Clear error messages for declined cards
  - "Save card for future" checkbox (Stripe Customer + SetupIntent)

- [ ] **6.4 — Implement cash payment options**
  - "Cash on Delivery" — order placed with paymentStatus: PENDING
  - "Cash at Pickup" — order placed with paymentStatus: PENDING
  - Admin marks as paid when cash collected

- [ ] **6.5 — Build checkout validation and order creation API** (`POST /api/orders`)
  - Validate all checkout data with Zod
  - Re-validate cart items (prices, availability) server-side
  - Re-validate promo code
  - Calculate totals server-side
  - Check business hours (reject if closed and no scheduled time)
  - Check delivery zone validity
  - Create Order + OrderItems in database (transaction)
  - Generate unique order number (e.g., `ND-20260313-001`)
  - For card payment: create Stripe PaymentIntent, return clientSecret
  - For cash: create order with PENDING payment status
  - Return order confirmation data

- [ ] **6.6 — Build order confirmation page** (`/order/[id]/confirmation`)
  - Order number prominently displayed
  - Order summary (items, totals)
  - Delivery/pickup details
  - Estimated time
  - "Track Your Order" button → `/track/[orderNumber]`
  - "Continue Shopping" link
  - Print receipt option
  - Prompt to create account (for guest users)

- [ ] **6.7 — Send order confirmation email**
  - Trigger on successful order creation
  - Include: order number, items, total, delivery/pickup details, estimated time
  - Branded email template (heritage look)
  - Include order tracking link

- [ ] **6.8 — Implement delivery fee calculation**
  - Based on delivery zones from BusinessSettings
  - Free delivery threshold check
  - Display fee in checkout dynamically

### Deliverable: Complete checkout flow — customers can choose delivery/pickup, pay by card or cash, receive confirmation email, and see confirmation page with tracking link.

---

## Phase 7 — Order Placement & Tracking

**Goal:** Real-time order tracking for customers; order lifecycle management.

### Steps:

- [ ] **7.1 — Build order tracking page** (`/track/[orderNumber]`)
  > 📌 **PROVIDE YOUR EXISTING ORDER TRACKING CODE HERE** — I will connect it to live order data via API/WebSocket and wire up the real-time status updates.

  **Tracking features to wire up:**
  - Look up order by order number (no login required)
  - Status progress bar: Received → Confirmed → Preparing → Ready → Completed
  - Current status highlighted with estimated time remaining
  - Order details recap (items, total, delivery address)
  - Order timestamp and status change history
  - "Contact Restaurant" button (phone link)
  - Auto-refresh status (polling every 30 seconds or WebSocket)

- [ ] **7.2 — Build order status API**
  - `GET /api/orders/[orderNumber]/status` — public endpoint (by order number)
  - `GET /api/orders/[id]` — authenticated endpoint (full order details)
  - `GET /api/orders/user` — logged-in user's order history

- [ ] **7.3 — Implement real-time order updates**
  - **Option A (simpler):** Polling every 30 seconds from tracking page
  - **Option B (better UX):** Socket.IO / Pusher channel per order
    - Admin status change → emit event → customer tracking page updates instantly
  - Start with polling for MVP, upgrade to WebSocket if time allows

- [ ] **7.4 — Build order history page** (`/profile/orders`)
  - List all past orders (paginated)
  - Each shows: order number, date, items summary, total, status
  - Click to expand full details
  - **"Reorder" button** — adds all items from past order to cart
  - Download receipt (PDF or printable page)

- [ ] **7.5 — Implement status change email notifications**
  - Email on: Order Confirmed, Preparing, Ready for Pickup / Out for Delivery, Completed
  - Each email includes order number, current status, estimated time
  - Unsubscribe option for non-essential notifications

- [ ] **7.6 — Build order cancellation flow**
  - Customer can cancel within X minutes (configurable)
  - `POST /api/orders/[id]/cancel`
  - Trigger refund via Stripe if already paid
  - Update order status to CANCELLED
  - Send cancellation email

### Deliverable: Customers can track orders in real-time, view order history, reorder past orders, and receive email updates at every status change.

---

## Phase 8 — Admin Dashboard & Management

**Goal:** Complete admin panel for managing orders, menu, settings, customers, promotions, and reports.

### Steps:

- [ ] **8.1 — Build admin layout and navigation**
  > 📌 **PROVIDE YOUR EXISTING OWNER DASHBOARD CODE HERE** — I will use it as the foundation for the admin layout and extend it with all the management sections listed below.

  **Admin shell:**
  - Sidebar navigation (collapsible on mobile):
    - Dashboard (overview)
    - Orders (with unread count badge)
    - Menu Management
    - Customers
    - Promotions
    - Reports & Analytics
    - Settings (sub-menu)
    - Content Pages
    - System
  - Top bar: admin name, notification bell, quick actions
  - "Pause Online Ordering" emergency button (always visible)

- [ ] **8.2 — Build admin Dashboard overview** (`/admin`)
  - Today's stats cards: orders count, revenue, average order value, new customers
  - Week/month comparison
  - Recent orders list (last 10)
  - Quick action buttons: View Orders, Edit Menu, Update Hours
  - Active order count by status (visual bar)

- [ ] **8.3 — Build Orders Management** (`/admin/orders`)
  - **Real-time order queue:**
    - New orders appear with audio alert (browser notification + sound)
    - Order cards: number, customer, type, time, total, payment status, current status
    - Color-coded by status
    - Time elapsed since placed
  - **Quick actions per order:**
    - Accept / Reject (with reason)
    - Advance status (one-click: Confirmed → Preparing → Ready → Completed)
    - Print order ticket (thermal printer friendly layout)
    - Cancel + Refund
    - Add internal note
    - View full details
  - **Filters:** status, order type, payment method, date range, search
  - **Sort:** time placed, scheduled time, amount
  - **Bulk actions:** select multiple → update status, print all

- [ ] **8.4 — Build Order Detail view (admin)**
  - Full customer contact info
  - Delivery address with embedded map (Google Maps)
  - All items with customizations and special instructions
  - Full price breakdown
  - Payment info and status
  - Status timeline (all status changes with timestamps and who changed)
  - Internal notes
  - Customer's order history link

- [ ] **8.5 — Build admin Orders API**
  - `GET /api/admin/orders` — paginated, filterable
  - `PATCH /api/admin/orders/[id]/status` — update status
  - `POST /api/admin/orders/[id]/reject` — reject with reason
  - `POST /api/admin/orders/[id]/refund` — process Stripe refund
  - `POST /api/admin/orders/[id]/notes` — add internal note

- [ ] **8.6 — Build Menu Management** (`/admin/menu`)
  - **Categories tab:**
    - List all categories with drag-and-drop reorder
    - Add new category (name, slug auto-generated, image)
    - Edit category name/image
    - Toggle visibility (show/hide)
    - Delete category (with item reassignment prompt)
  - **Items tab:**
    - Filterable/searchable list of all menu items
    - Add new item form (all fields from MenuItem model)
    - Rich text editor for description and heritage story
    - Image upload with preview, crop, and resize
    - Customization options builder (sizes, add-ons, modifications with prices)
    - Toggle availability / mark as "Sold Out"
    - Set daily quantity limits
    - Duplicate item
    - Delete item (soft delete)
  - **Bulk actions:**
    - Bulk price adjustment (percentage or fixed amount)
    - Bulk category move
    - Bulk availability toggle
    - Export menu to CSV
    - Import menu from CSV

- [ ] **8.7 — Build admin Menu API**
  - `GET/POST /api/admin/categories` — list and create
  - `PATCH/DELETE /api/admin/categories/[id]` — update and delete
  - `PATCH /api/admin/categories/reorder` — update sort order
  - `GET/POST /api/admin/menu-items` — list and create
  - `PATCH/DELETE /api/admin/menu-items/[id]` — update and delete
  - `POST /api/admin/menu-items/[id]/options` — manage customization options
  - `POST /api/admin/upload` — image upload endpoint

- [ ] **8.8 — Build Business Settings** (`/admin/settings`)
  - **General Info:** business name, phone, email, address, socials, logo, brand colors
  - **Operating Hours:**
    - Day-by-day schedule editor
    - Multiple time slots per day
    - Holiday/special date overrides
    - Vacation mode toggle with message and return date
  - **Ordering Options:**
    - Enable/disable delivery and pickup
    - Delivery zones editor (radius or zone-based with different fees)
    - Minimum order amounts
    - Free delivery threshold
    - Order throttling (max orders per hour)
    - Advance scheduling limit (how many days ahead)
    - Auto-accept vs manual review toggle
  - **Tax & Fees:**
    - Tax rate
    - Tax-inclusive vs exclusive toggle
    - Service fee
    - Tip options (percentages)
  - **Payment:**
    - Enable/disable card, COD, cash at pickup
    - Stripe connection status
    - Test mode toggle

- [ ] **8.9 — Build admin Settings API**
  - `GET /api/admin/settings` — fetch all settings
  - `PATCH /api/admin/settings` — update settings
  - `POST /api/admin/settings/hours` — update operating hours
  - `POST /api/admin/settings/delivery-zones` — update delivery zones

- [ ] **8.10 — Build Customer Management** (`/admin/customers`)
  - Paginated customer list with search
  - Each row: name, email, phone, total orders, total spent, last order date
  - Customer detail view: full profile, order history, notes, VIP flag
  - Add internal notes per customer
  - Export customer list to CSV

- [ ] **8.11 — Build Promotions Management** (`/admin/promotions`)
  - Create promo code form: code, discount type/value, min order, max discount, date range, usage limit, applicable items/categories
  - List active/expired codes with usage stats
  - Edit/deactivate/duplicate codes
  - View redemption history

- [ ] **8.12 — Build Reports & Analytics** (`/admin/reports`)
  - **Sales Dashboard:**
    - Revenue by day/week/month (chart)
    - Orders count by day/week/month (chart)
    - Average order value trend
    - Revenue by category (pie chart)
    - Delivery vs pickup breakdown
    - Payment method breakdown
  - **Menu Performance:**
    - Best sellers ranking
    - Least popular items
    - Revenue per item
  - **Customer Insights:**
    - New vs returning customers
    - Repeat order rate
  - **Date range selector** for all reports
  - **Export to CSV**

- [ ] **8.13 — Build Reports API**
  - `GET /api/admin/reports/sales` — sales data with date range
  - `GET /api/admin/reports/orders` — order analytics
  - `GET /api/admin/reports/menu-performance` — item-level metrics
  - `GET /api/admin/reports/customers` — customer metrics

- [ ] **8.14 — Build User/Staff Management** (`/admin/settings/users`)
  - List admin team members
  - Add new admin user with role (Owner, Manager, Kitchen Staff, View-only)
  - Edit roles, deactivate accounts
  - View activity logs per user

- [ ] **8.15 — Implement activity logging**
  - Log all admin actions to ActivityLog table
  - View activity feed in admin dashboard

### Deliverable: Fully functional admin dashboard — owner can manage all orders, menu, settings, customers, promotions, and view reports.

---

## Phase 9 — Notifications, Policies & Content Pages

**Goal:** Complete the notification system, static content pages, and remaining customer-facing features.

### Steps:

- [ ] **9.1 — Build email notification system**
  - Email templates (branded, heritage design):
    - Welcome / Registration
    - Order Confirmation
    - Order Status Updates (Confirmed, Preparing, Ready, Completed)
    - Order Cancellation
    - Password Reset
    - Promotional (future use)
  - Send via Resend or SendGrid
  - Admin notification: new order email alert
  - Daily sales summary email to owner

- [ ] **9.2 — Build admin notification center**
  - In-dashboard notification bell
  - Audio alert for new orders (configurable)
  - Browser push notification for new orders (optional)
  - Mark as read/unread

- [ ] **9.3 — Build About page** (`/about`)
  - Restaurant story with heritage focus
  - Team/owner photos
  - Mission and values
  - Heritage of Filipino delicacies narrative

- [ ] **9.4 — Build Contact page** (`/contact`)
  - Phone, email, address
  - Embedded Google Map
  - Social media links
  - Contact form (submit via API, sends email to owner)

- [ ] **9.5 — Build Policy pages** (`/policies/*`)
  - Delivery Areas & Fees
  - Refund & Cancellation Policy
  - Privacy Policy
  - Terms and Conditions
  - Content managed via admin Content Pages section

- [ ] **9.6 — Build admin Content Pages editor** (`/admin/content`)
  - WYSIWYG editor for each static page
  - Hero banner management (image, headline, CTA for homepage)
  - Announcement banner (site-wide top bar message)
  - Save drafts, publish changes

- [ ] **9.7 — Build site-wide announcement banner**
  - Top-of-page dismissible banner
  - Content managed from admin settings
  - Schedule display timing

- [ ] **9.8 — Implement PWA features**
  - Web app manifest (name, icons, theme color)
  - Service worker for offline shell (basic)
  - "Add to Home Screen" prompt on mobile
  - App-like navigation experience

### Deliverable: Complete notification system, all static content pages, admin content management, and PWA capabilities.

---

## Phase 10 — Testing, Optimization & Launch

**Goal:** Ensure quality, performance, security, and prepare for production launch.

### Steps:

- [ ] **10.1 — Security audit and hardening**
  - CSRF protection on all mutations (Next.js built-in + custom tokens)
  - XSS prevention (React auto-escaping + sanitize user inputs displayed in admin)
  - SQL injection prevention (Prisma parameterized queries — already safe)
  - Rate limiting on: login, register, order placement, API endpoints
  - Secure headers (Content-Security-Policy, X-Frame-Options, etc.)
  - HTTPS enforcement
  - Stripe webhook signature verification
  - Input validation on all API routes (Zod)
  - Admin route protection verification
  - Password hashing verification (bcrypt, cost factor ≥ 10)
  - Sensitive data never exposed in API responses

- [ ] **10.2 — Performance optimization**
  - Lighthouse audit (target > 90 on all metrics)
  - Image optimization audit (all images via Next.js Image + Cloudinary)
  - Bundle analysis and code splitting review
  - Database query optimization (add indexes for common queries)
  - API response time audit (target < 500ms)
  - Implement ISR (Incremental Static Regeneration) for menu pages
  - Cache static data (business settings, categories)

- [ ] **10.3 — Mobile responsiveness QA**
  - Test on: iPhone SE, iPhone 14, Samsung Galaxy, iPad, various desktops
  - Test touch targets (minimum 44px)
  - Test all flows end-to-end on mobile
  - Test admin dashboard on tablet

- [ ] **10.4 — Cross-browser testing**
  - Chrome, Safari, Firefox, Edge (latest 2 versions)
  - Test payment flow in all browsers
  - Test PWA features in each browser

- [ ] **10.5 — End-to-end testing**
  - Complete customer journey: browse → customize → cart → checkout → pay → track
  - Guest checkout flow
  - Registered user flow with saved addresses
  - Bilao Builder → cart → checkout
  - Promo code application
  - Schedule-for-later order
  - Gift order with message
  - Order cancellation and refund
  - Admin: receive order → update status through completion
  - Admin: full menu CRUD cycle
  - Admin: settings changes reflect on storefront
  - Payment failure scenarios
  - Closed business scenario

- [ ] **10.6 — Set up production infrastructure**
  - Deploy to Vercel (connect Git repo)
  - Provision production PostgreSQL (Neon or Supabase)
  - Run production migration
  - Configure production environment variables
  - Set up custom domain + SSL
  - Configure Stripe live mode keys
  - Set up Resend/SendGrid production sender domain
  - Configure Cloudinary production account
  - Set up Vercel Analytics

- [ ] **10.7 — Set up monitoring and error tracking**
  - Vercel Analytics for performance
  - Sentry for error tracking (free tier)
  - Uptime monitoring (UptimeRobot or similar)
  - Set up alerts for: errors, downtime, payment failures

- [ ] **10.8 — Set up automated backups**
  - Daily database backups (Neon/Supabase built-in)
  - Image/asset backup strategy
  - Document backup restoration procedure

- [ ] **10.9 — Create production seed data**
  - Create owner admin account
  - Set real business settings (hours, address, phone, delivery zones)
  - Populate real menu with all items, descriptions, heritage stories
  - Upload real product photography
  - Set real prices, tax rate, delivery fees

- [ ] **10.10 — Soft launch**
  - Deploy to production
  - Test with real orders (internal team)
  - Test Stripe live payments (small amounts)
  - Test email deliverability
  - Fix any issues found
  - Staff training on admin dashboard

- [ ] **10.11 — Go live**
  - Enable public access
  - Monitor first real orders closely
  - Be ready for quick fixes
  - Gather initial customer feedback

### Deliverable: Production-ready, secure, performant application live on custom domain.

---

## Existing Code Integration Points Summary

| Step | Code Needed | What I'll Do With It |
|------|-------------|---------------------|
| **4.2** | Home page code | Integrate with backend data fetching, wire up to live menu/settings APIs |
| **5.3** | Shopping Cart code | Connect to Zustand store, wire API sync, enable customization editing |
| **5.4** | Bilao Builder code | Connect to menu DB data, wire "Add to Cart" to Zustand store |
| **7.1** | Order Tracking code | Connect to live order data API, wire up real-time polling/WebSocket |
| **8.1** | Owner Dashboard code | Use as admin layout foundation, extend with all management sections |

> At each of these steps, just share the code and I'll handle the integration.

---

## File/Folder Quick Reference

```
Key files you'll interact with most:

src/app/(storefront)/page.tsx           → Homepage
src/app/(storefront)/menu/page.tsx      → Menu browsing
src/app/(storefront)/menu/[slug]/page.tsx → Item detail
src/app/(storefront)/bilao-builder/page.tsx → Bilao Builder
src/app/(storefront)/cart/page.tsx      → Cart page
src/app/(storefront)/checkout/page.tsx  → Checkout
src/app/(storefront)/track/[orderNumber]/page.tsx → Order tracking
src/app/admin/page.tsx                  → Admin dashboard
src/app/admin/orders/page.tsx           → Order management
src/app/admin/menu/page.tsx             → Menu management
src/app/admin/settings/page.tsx         → Business settings
src/stores/cart-store.ts                → Cart state management
src/lib/prisma.ts                       → Database client
src/lib/auth.ts                         → Authentication config
src/lib/stripe.ts                       → Payment config
prisma/schema.prisma                    → Database schema
```

---

## Definition of Done (per Phase)

Each phase is complete when:
1. All listed steps have checkboxes ticked
2. No TypeScript or lint errors
3. All new API routes return correct responses
4. UI is responsive on mobile and desktop
5. New features work end-to-end (manual test)
6. No security vulnerabilities introduced

---

**Ready to start? Begin with Phase 1 and provide your existing code when we reach the integration steps (4.2, 5.3, 5.4, 7.1, 8.1).**
