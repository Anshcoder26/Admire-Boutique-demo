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
| `RAZORPAY_WEBHOOK_SECRET` | recommended with payments | Verifies the Razorpay webhook (see "Online payments" below). |
| `PAYMENT_WINDOW_MINUTES` | optional | How long an unpaid online order holds stock before auto-cancel (default 15). |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `ADMIN_EMAIL` | for email | Transactional email (password reset, order confirmation + invoice). No-ops if unset. `RESEND_FROM_EMAIL` must be on a domain verified in Resend. |
| `WHATSAPP_ACCESS_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` | for WhatsApp | Order notifications via Meta WhatsApp Cloud API. Skipped if unset. See "Order notifications" below. |
| `NEXT_PUBLIC_APP_URL` | recommended | Public site URL; used for email links and CSRF origin allow-listing. |
| `SENTRY_DSN` | optional | Enables server error reporting. No-op when unset. |

Startup validation (`src/lib/env.ts`, run from `src/instrumentation.ts`) fails fast
in production if `DATABASE_URL` is missing and warns for missing optional config.

## Admin bootstrap & rotation

- The first admin is seeded **only when `admin_users` is empty**, using
  `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD`.
- Changing `ADMIN_BOOTSTRAP_PASSWORD` later does **not** update an existing admin.
- To rotate or recover: run `npm run admin:set-password -- <email>` (prompts for
  the new password; set `DATABASE_URL` to target production). It creates the
  admin if missing and signs out existing admin sessions.

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

## Online payments (Razorpay)

Order lifecycle for online payments:

1. **Place order** → order is created as **Awaiting Payment** (payment `Pending`)
   and the items are reserved, for `PAYMENT_WINDOW_MINUTES` (default 15).
   No "order placed" notification is sent yet.
2. **Payment fails / popup closed** → the order stays Awaiting Payment. The
   customer can retry on the *same* order from checkout ("Retry payment") or
   from My Orders; no duplicate orders are created.
3. **Payment verified** (browser callback or webhook, whichever comes first)
   → **Confirmed / Paid**, and the customer gets the email + WhatsApp receipt.
4. **Not paid within the window** → automatically **Cancelled** (payment
   `Failed`) and the stock is returned. Expiry is checked lazily on
   checkout, product listings, My Orders and the admin orders list — no cron needed.
5. **Paid after cancellation** (rare, e.g. a delayed UPI) → the order is revived
   if stock is still available; otherwise it is marked **Refund Due**, and the
   owner (`ADMIN_EMAIL`) and customer are emailed. Refund it from the Razorpay
   dashboard and set the payment status to *Refunded*.

Webhook setup (Razorpay Dashboard → Account & Settings → Webhooks → Add):

- URL: `https://<your-domain>/api/webhooks/razorpay`
- Secret: any strong random string; put the same value in `RAZORPAY_WEBHOOK_SECRET`
- Events: `payment.captured` and `order.paid`

## Order notifications

`src/lib/notifications/` sends order updates through two independent channels:

| Channel | Customer receives | Owner receives |
| --- | --- | --- |
| Email (`email-channel.ts`) | Order details + PDF invoice attached | "New order / payment received" alert at `ADMIN_EMAIL` |
| WhatsApp (`whatsapp-channel.ts`) | Template message + PDF invoice | — |

When they fire:

- **Cash on Delivery:** when the order is placed (`order_placed`).
- **Online (Razorpay):** only after the payment signature is verified (`payment_received`), so abandoned payments send nothing.

Each channel is skipped if unconfigured, and one failing never blocks the other or the
order. Results are logged with a `[NOTIFY]` prefix.

### WhatsApp setup (Meta Cloud API)

1. Create an app at developers.facebook.com, add the **WhatsApp** product, and note the
   **Phone number ID** and access token under WhatsApp → API Setup. In production use a
   permanent System User token.
2. In WhatsApp Manager → Message templates, create two **Utility** templates in the same
   language, each with a **Document** header and these body variables:
   - `order_confirmation`: e.g. "Hi {{1}}, your order {{2}} is confirmed. Amount payable on
     delivery: {{3}}. Your invoice is attached."
   - `payment_receipt`: e.g. "Hi {{1}}, we've received your payment for order {{2}} of {{3}}.
     Your receipt is attached."
3. Once approved, set `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` and (if you used
   different names or language) the `WHATSAPP_TEMPLATE_*` vars. While testing, add your own
   number as a recipient on the API Setup page.

WhatsApp's policy requires customers to opt in to business messages; make sure your checkout
or terms cover this.

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
