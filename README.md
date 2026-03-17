# J&J Native Delicacies — Filipino Heritage Treats

A full-stack e-commerce platform for ordering authentic J&J Native Delicacies online. Customers can browse a curated menu of traditional kakanin, pastries, sweets, and regional specialties — build custom bilao trays, checkout with Stripe, track orders in real time, and more.

## Features

### Storefront
- **Menu Browsing** — Filter by category, region, dietary tags, and search with pagination
- **Bilao Builder** — Build your own custom bilao tray by selecting from available items
- **Shopping Cart** — Persistent cart with Zustand, item customization, quantity management
- **Checkout** — Guest or authenticated, delivery/pickup, scheduled orders, gift messages, promo codes
- **Stripe Payments** — Secure card payments with real-time webhook processing
- **Order Tracking** — Track order status by order number with live status updates
- **User Profiles** — Saved addresses, order history, password management
- **PWA** — Installable progressive web app with offline support

### Admin Dashboard
- **Order Management** — View, filter, and update order status through the full lifecycle
- **Menu Management** — Full CRUD for menu items, categories, options, and availability
- **Customer Management** — View customers, order counts, and activity
- **Staff Management** — Create and manage admin/manager/staff accounts with role-based access
- **Promotions** — Create and manage promo codes (percentage or fixed discount)
- **Business Settings** — Operating hours, delivery zones, fees, tax rate, order acceptance toggle
- **Content Editor** — Edit policy pages and manage the announcement banner
- **Analytics & Reports** — Revenue, order stats, and activity logs
- **Notification Center** — Real-time notifications for new orders and contact messages

### Other
- **Email Notifications** — Branded HTML templates for confirmations, status updates, and alerts (via Resend)
- **Security** — HSTS, X-Frame-Options, CSP headers, rate limiting, Zod validation, bcrypt hashing
- **Performance** — ISR on homepage, database indexes, image optimization (AVIF/WebP)
- **Policy Pages** — Delivery, refund, privacy, and terms of service

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL + Prisma 7 |
| Auth | NextAuth v5 (JWT) |
| Payments | Stripe |
| Email | Resend |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Testing | Playwright |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Stripe account (test keys for development)
- Resend account (for email)

### Installation

```bash
git clone https://github.com/Jones-Latras/jj-native-delicacies.git
cd jj-native-delicacies
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

### Database Setup

```bash
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:seed        # Seed sample data
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront.

**Default admin login:** `admin@jjnativedelicacies.ph` / `Admin123!`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run Playwright with interactive UI |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed development data |
| `npm run db:seed:prod` | Seed production data |
| `npm run db:reset` | Reset database |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, register, forgot/reset password
│   ├── (storefront)/        # Public pages (home, menu, cart, checkout, etc.)
│   ├── admin/               # Admin dashboard pages
│   └── api/                 # API routes (~45 endpoints)
├── components/
│   ├── admin/               # Admin-specific components
│   ├── shared/              # Shared components (auth, PWA, announcements)
│   ├── storefront/          # Storefront components (menu, cart, etc.)
│   └── ui/                  # Base UI components (Button, Input, etc.)
├── lib/                     # Utilities (auth, email, Stripe, Prisma, etc.)
├── stores/                  # Zustand state stores
└── types/                   # TypeScript type definitions
prisma/
├── schema.prisma            # Database schema (14 models)
├── seed.ts                  # Development seed data
└── seed-production.ts       # Production seed script
e2e/                         # Playwright E2E tests
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full production deployment guide covering Vercel, database provisioning, Stripe live mode, email setup, and monitoring.

## License

This project is private and not licensed for redistribution.


