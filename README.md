# Admire Boutique

E-commerce storefront for Indian unstitched suit materials and kurtis, built with
Next.js 16 (App Router, Turbopack). Supports a customer storefront, checkout with
Razorpay, and an admin panel for catalog and order management.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in values (see below)
npm run dev
```

Open http://localhost:3000. In local development the app uses a SQLite database at
`data/admire_boutique.db` (auto-created). In production it uses PostgreSQL via
`DATABASE_URL`.

## Environment variables

See `.env.local.example` for the full annotated list. Summary:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | **prod** | PostgreSQL connection string. Required in production — SQLite in `/tmp` is ephemeral on serverless. |
| `ADMIN_BOOTSTRAP_EMAIL` | recommended | Email for the first admin account seeded on an empty DB. |
| `ADMIN_BOOTSTRAP_PASSWORD` | **prod** | Password for the seeded admin (min 8 chars). In dev a random one is generated and logged once. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | for payments | Razorpay credentials; checkout is disabled without them. |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `ADMIN_EMAIL` | for email | Transactional email (password reset, order confirmation). No-ops if unset. |
| `NEXT_PUBLIC_APP_URL` | recommended | Public site URL; used for email links and CSRF origin allow-listing. |
| `SENTRY_DSN` | optional | Enables server error reporting. No-op when unset. |

Startup validation (`src/lib/env.ts`, run from `src/instrumentation.ts`) fails fast
in production if `DATABASE_URL` is missing and warns for missing optional config.

## Admin bootstrap & rotation

- The first admin is seeded **only when `admin_users` is empty**, using
  `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD`.
- Changing `ADMIN_BOOTSTRAP_PASSWORD` later does **not** update an existing admin.
- To rotate: log in and change the password in the admin panel (or reset the
  `admin_users` row and redeploy to re-seed).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack). |
| `npm run build` | Production build. |
| `npm start` | Run the production server. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm test` | Unit tests (Node test runner via tsx). |
| `npm run lint` | ESLint. |

## Security features

- **DB-backed sessions** with httpOnly, `SameSite=Lax`, secure-in-prod cookies.
- **CSRF defense-in-depth**: Origin/Referer verification on mutating `/api/*`
  requests (`src/proxy.ts` + `src/lib/csrf.ts`), on top of `SameSite=Lax`.
- **DB-backed rate limiting** on auth, admin login, checkout, newsletter, and
  password-reset routes (`src/lib/rate-limiter.ts`).
- **Payment integrity**: Razorpay signature + order-ownership (IDOR) checks before
  marking an order paid.
- **Security headers** (CSP report-only, HSTS, X-Frame-Options, etc.) via
  `next.config.ts`; `x-powered-by` disabled.
- **Redacting logger** (`src/lib/logger.ts`) — quiet in prod, strips secrets/tokens/
  signatures from log output.

## Health check

`GET /api/health` returns database connectivity and build info (200 healthy /
503 degraded). Use it for uptime and deploy checks.

## Deploy checklist (Vercel)

1. Set `DATABASE_URL` (PostgreSQL), `ADMIN_BOOTSTRAP_EMAIL`,
   `ADMIN_BOOTSTRAP_PASSWORD`, `RAZORPAY_KEY_ID`/`SECRET`, `RESEND_*`,
   `NEXT_PUBLIC_APP_URL` in Project → Settings → Environment Variables.
2. Deploy; confirm `GET /api/health` returns `{"status":"ok"}`.
3. Log in to the admin panel with the bootstrap credentials and rotate the password.
4. (Optional) Set `SENTRY_DSN` to enable error tracking.

> **Serverless note:** sessions and rate-limit counters live in the database, so
> they survive across serverless invocations and cold starts. Expired sessions,
> used password-reset tokens, and stale rate-limit rows are pruned opportunistically
> on cold start (`cleanupExpiredRows`).

## Continuous integration

`.github/workflows/ci.yml` runs install → typecheck → test → build on pushes and
PRs to `main`.
