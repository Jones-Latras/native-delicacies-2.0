# Production Deployment Guide

## Prerequisites

- [Vercel](https://vercel.com) account connected to your Git repository
- Production PostgreSQL database (Neon or Supabase recommended)
- Stripe account with live API keys
- Resend account with verified sender domain
- Cloudinary account for image hosting
- Custom domain name

---

## 1. Environment Variables

Set these in your Vercel project settings → Environment Variables:

```env
# Database (use pooled connection URL for Vercel serverless)
DATABASE_URL=postgres://user:pass@host:5432/dbname?sslmode=require
DIRECT_DATABASE_URL=postgres://user:pass@host:5432/dbname?sslmode=require

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Stripe (LIVE keys)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...
EMAIL_FROM=orders@yourdomain.com
BUSINESS_EMAIL=admin@yourdomain.com

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

# App
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

---

## 2. Database Setup

### Using Neon (recommended)

1. Create a new project at [neon.tech](https://neon.tech)
2. Copy the connection string (pooled for `DATABASE_URL`, direct for `DIRECT_DATABASE_URL`)
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. Seed production data:
   ```bash
   npx tsx prisma/seed-production.ts
   ```

### Using Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → Database → Connection string
3. Use the "Session" mode URL for `DIRECT_DATABASE_URL`
4. Follow same migrate + seed steps above

---

## 3. Stripe Configuration

1. Switch to Live mode in Stripe Dashboard
2. Copy live API keys to environment variables
3. Set up webhook endpoint:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

---

## 4. Email Configuration (Resend)

1. Add and verify your sender domain
2. Create an API key
3. Set `EMAIL_FROM` to a verified sender address
4. Test email delivery in staging first

---

## 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your Git repository for automatic deployments on push.

### Vercel Project Settings

- **Framework Preset:** Next.js
- **Build Command:** `npx prisma generate && next build`
- **Output Directory:** `.next`
- **Node.js Version:** 20.x

---

## 6. Custom Domain

1. In Vercel → Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL is automatic with Vercel

---

## 7. Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Run `prisma migrate deploy` against production DB
- [ ] Seed production data (admin account, business settings, menu items)
- [ ] Test Stripe live payments with a small amount
- [ ] Verify email delivery (registration, order confirmation)
- [ ] Test all user flows (browse, cart, checkout, track order)
- [ ] Test admin dashboard (login, order management, settings)
- [ ] Verify PWA manifest and service worker
- [ ] Check security headers (use securityheaders.com)
- [ ] Check Lighthouse scores (target >90)
- [ ] Set up uptime monitoring (UptimeRobot, BetterUptime)
- [ ] Configure Vercel Analytics
- [ ] Set up error alerting (Sentry or Vercel Log Drains)

---

## 8. Monitoring

### Vercel Analytics
Enable in Vercel Dashboard → Analytics. Tracks Web Vitals automatically.

### Error Tracking
Install Sentry when ready:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Uptime Monitoring
Set up a free monitor at [uptimerobot.com](https://uptimerobot.com):
- Monitor URL: `https://yourdomain.com`
- Check interval: 5 minutes
- Alert contacts: your email + SMS

---

## 9. Backup Strategy

### Database
- **Neon:** Automatic point-in-time recovery (7 days on free tier)
- **Supabase:** Daily automatic backups (7 days on free tier)

### Images
- Cloudinary handles asset durability and CDN
- Periodically export asset list for records

---

## 10. Scaling Notes

- **Database:** Neon auto-scales compute. Monitor connection count.
- **Serverless Functions:** Vercel auto-scales. Monitor function duration.
- **Images:** Cloudinary CDN handles load. Set up transformations for thumbnails.
- **Rate Limiting:** Current in-memory limiter works per-instance. For high traffic, switch to Upstash Redis:
  ```bash
  npm install @upstash/ratelimit @upstash/redis
  ```
