# Production Deployment Guide - Vercel + Supabase Postgres

## Architecture

- App hosting: Vercel (Next.js)
- Database: Supabase Postgres
- ORM: Prisma + `@prisma/adapter-pg`

---

## 1. Create the Supabase database

1. Create a Supabase project.
2. In Supabase, open `Connect` and copy:
   - the Supavisor transaction mode connection string on port `6543`
   - the direct connection string or Supavisor session mode string on port `5432`
3. Create a dedicated Prisma database role instead of using the default `postgres` role.

Recommended SQL from Supabase:

```sql
create user "prisma" with password 'strong_password' bypassrls createdb;
grant "prisma" to "postgres";
grant usage on schema public to prisma;
grant create on schema public to prisma;
grant all on all tables in schema public to prisma;
grant all on all routines in schema public to prisma;
grant all on all sequences in schema public to prisma;
alter default privileges for role postgres in schema public grant all on tables to prisma;
alter default privileges for role postgres in schema public grant all on routines to prisma;
alter default privileges for role postgres in schema public grant all on sequences to prisma;
```

---

## 2. Environment variables

Set these in Vercel Project -> Settings -> Environment Variables:

```env
# Supabase Postgres
# Runtime connection for Vercel / serverless
DATABASE_URL=postgresql://prisma.PROJECT_REF:YOUR_DB_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# Optional in Vercel, but recommended for parity with local tooling
DIRECT_URL=postgresql://prisma.PROJECT_REF:YOUR_DB_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Stripe / Xendit / Email
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...
XENDIT_SECRET_KEY=...
XENDIT_WEBHOOK_TOKEN=...
RESEND_API_KEY=...
EMAIL_FROM_NAME=J&J Native Delicacies
EMAIL_FROM_ADDRESS=orders@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

Local `.env.local` should use the same two database variables.

---

## 3. Why there are two database URLs

- `DATABASE_URL`: app runtime traffic on Vercel. Use Supabase transaction mode (`6543`) because serverless functions create short-lived connections.
- `DIRECT_URL`: Prisma migrations, seeds, Studio, and other management commands. Use a direct connection if your environment supports IPv6, otherwise use Supabase session mode (`5432`).

This repo is already configured for that split:

- `src/lib/prisma.ts` prefers `DATABASE_URL`
- `prisma.config.ts` prefers `DIRECT_URL`
- `prisma/seed.ts` and `prisma/seed-production.ts` prefer `DIRECT_URL`

---

## 4. Deploy to Vercel

### Option A - Git integration

1. Connect the GitHub repo to Vercel.
2. Add the environment variables above.
3. Redeploy.

### Option B - CLI

```bash
npm i -g vercel
vercel --prod
```

Recommended Vercel project settings:

- Framework Preset: `Next.js`
- Build Command: `prisma generate && next build`
- Output Directory: `.next`
- Node.js Version: `20.x`

---

## 5. Run Prisma migrations

After setting local `.env.local`, run:

```bash
npx prisma migrate deploy
```

Then seed data:

```bash
npx tsx prisma/seed-production.ts
```

If `DIRECT_URL` is a direct Supabase connection, make sure your environment supports IPv6. If not, use the Supavisor session mode URL on port `5432`.

---

## 6. Post-deployment checklist

- [ ] Supabase project created
- [ ] Prisma database user created
- [ ] `DATABASE_URL` set to transaction mode (`6543`) with `pgbouncer=true&connection_limit=1`
- [ ] `DIRECT_URL` set to direct or session mode (`5432`)
- [ ] Prisma migrations applied
- [ ] Production data seeded
- [ ] Auth, email, payment, and webhook env vars set
- [ ] Checkout flow tested end-to-end
- [ ] Admin dashboard tested end-to-end
- [ ] Custom domain configured

---

## 7. Notes

- Supabase transaction mode does not support prepared statements, so the runtime connection string should include `pgbouncer=true`.
- For serverless deployments, start with `connection_limit=1` and increase only if needed.
- If you see direct-connection failures from an IPv4-only environment, switch `DIRECT_URL` to the Supavisor session mode string instead of the direct URL.
