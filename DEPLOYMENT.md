# Production Deployment Guide — Vercel + Railway PostgreSQL

## Architecture

- **App hosting:** Vercel (Next.js serverless)
- **Database:** Railway PostgreSQL (external)

---

## 1. Railway PostgreSQL Setup

1. Create a PostgreSQL service in your [Railway](https://railway.app) project.
2. Copy the **public** connection string from Railway → PostgreSQL → Variables → `DATABASE_URL`.

---

## 2. Environment Variables (Vercel)

Set these in **Vercel → Project → Settings → Environment Variables**:

```env
# Database (Railway Postgres public URL)
DATABASE_URL=postgresql://postgres:xxx@xxx.proxy.rlwy.net:PORT/railway

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Stripe (LIVE keys)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...
EMAIL_FROM_NAME=J&J Native Delicacies
EMAIL_FROM_ADDRESS=orders@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 3. Deploy to Vercel

### Option A — Git integration (recommended)

1. Connect your GitHub repo to Vercel.
2. Set the environment variables above.
3. Vercel will auto-deploy on each push.

### Option B — CLI

```bash
npm i -g vercel
vercel --prod
```

### Vercel Project Settings

- **Framework Preset:** Next.js
- **Build Command:** `prisma generate && next build`
- **Output Directory:** `.next`
- **Node.js Version:** 20.x

---

## 4. Run Migrations (one-time)

After setting `DATABASE_URL` in your local `.env.local`, run:

```bash
npx prisma migrate deploy
```

Then seed production data:

```bash
npx tsx prisma/seed-production.ts
```

---

## 5. Post-Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Migrations applied to Railway Postgres
- [ ] Production seeded (admin account + business settings)
- [ ] Test Stripe live payments
- [ ] Verify email delivery (registration, order confirmation)
- [ ] Test all user flows (browse → cart → checkout → track)
- [ ] Test admin dashboard (login, orders, settings)
- [ ] Verify PWA manifest and service worker
- [ ] Configure custom domain + SSL (automatic on Vercel)

---

## 6. Custom Domain

1. In Vercel → Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to match
5. Update Stripe webhook endpoint URL

