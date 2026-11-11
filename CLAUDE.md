# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Admire Boutique: Next.js 16 (App Router) store for Indian suits/kurtis with Razorpay checkout, Cash on Delivery with a ₹500 UPI advance, customer reviews, and an owner dashboard at `/admin`. Production is admireboutique.in on Hostinger, which auto-deploys from `main` and uses PostgreSQL.

## Commands

```bash
npm run dev          # dev server; local DB is SQLite at data/admire_boutique.db (auto-created)
npm run build        # next build --webpack (same as CI)
npm run typecheck    # tsc --noEmit
npm test             # all unit tests: node --import tsx --test tests/*.test.ts
node --import tsx --test tests/cod.test.ts                          # one test file
node --import tsx --test --test-name-pattern="rating" tests/reviews.test.ts  # one test by name
npm run lint         # eslint (CI does NOT run lint; header.tsx has a known set-state-in-effect error)
npm run admin:set-password -- <email>   # set/reset owner password; uses DATABASE_URL if set, else local SQLite
```

CI (`.github/workflows/ci.yml`) runs `npm ci → typecheck → test → build` on pushes/PRs to `main`.

End-to-end scripts hit a running server: `CUSTOMER_PASSWORD=… ADMIN_PASSWORD=… bash tests/flow_test.sh` and `tests/payment_e2e.sh` (uses the fake SMTP/WhatsApp sinks in `tests/sinks.mjs`; see its header for setup). They are bash 3.2-compatible on macOS.

## Architecture

**One data layer, two databases.** `src/lib/db.ts` holds every query. Each exported function has a `usesPostgres` branch (`pg`, `$1` placeholders, runs after `ensurePostgresReady()`) and a better-sqlite3 branch (`?` placeholders). Some functions write SQL once with `$n` and convert it via `.replace(/\$\d+/g, "?")`. Schema is `CREATE TABLE IF NOT EXISTS` plus column-adding migrations that run on every startup in both branches (Postgres needs one statement per `query()`). So new tables and columns must be added to **both** schema blocks, and they reach production on the next deploy. JSON columns (`items_json`, `address_json`, `photos_json`) are text, parsed with `parseJsonArray`/`parseJsonObject`.

**Order lifecycle** (status strings live in `src/lib/order-status.ts`):
- Online: `Awaiting Payment` (stock reserved for `PAYMENT_WINDOW_MINUTES`) → `Confirmed`/`Paid` once the Razorpay signature is verified (browser callback or `/api/webhooks/razorpay`, whichever comes first). Unpaid orders are cancelled lazily by `sweepExpiredOrders()` in `src/lib/payments.ts`, which runs on product listings, checkout, My Orders and the admin list. There is no cron. A payment arriving after cancellation revives the order or marks it `Refund Due`. `isPaymentAlreadyHandled` blocks replayed payments.
- COD: `Awaiting COD Advance`. The owner confirms the UPI reference in the dashboard (`/api/admin/cod-orders`), which rejects a reused reference. Nothing auto-cancels; after 48h the order is flagged and the owner cancels it by hand. Constants and helpers are in `src/lib/cod.ts`. Revenue in `getAdminStats` excludes unconfirmed COD, cancelled and refunded orders.

**Notifications** (`src/lib/notifications/`): a dispatcher fans out to independent channels: customer email (Resend/SMTP, with a PDF invoice), customer WhatsApp (Meta Cloud API templates), and owner WhatsApp. A channel without config is skipped, and one failing never blocks another or the order. Routes send them after responding, via `after()` from `next/server`. WhatsApp template names and variables are listed in README.md.

**Auth & security.**
- Customers use the `admire-session` cookie; resolve it with `validateUserSessionToken`.
- The owner uses a separate admin session; admin API routes start with `authenticateAdmin(request)` from `src/lib/admin-auth.ts`.
- Sessions and rate limits live in the DB. Use `checkRateLimit(key, …)` with limits from `AUTH_RATE_LIMITS` in `src/lib/auth-utils.ts`.
- `src/proxy.ts` (Next 16's replacement for middleware) enforces a CSRF Origin/Referer check on mutating `/api/*` requests. Scripted requests to the API need an `Origin` header matching the app URL.
- Use `safeRedirectPath` for any `?redirect=` value, and `textFieldsOnly` for stored address objects shown to the owner.

**Photos are base64 data URLs stored in the DB**, never sent inline in pages.
- Product photos are served by `/api/products/[id]/images/[file]`, using fingerprinted links from `src/lib/product-images.ts`.
- Review photos are served by `/api/reviews/[id]/photos/[index]`. Photos of removed reviews are visible only to the owner.
- Uploads are shrunk in the browser first with `compressImageFile` from `src/lib/image-compress.ts`.
- `decodePhotoDataUrl` allows only real image types.

**Reviews** (`src/lib/reviews.ts`, browser-safe constants in `src/lib/review-policy.ts`, the reviews functions at the end of `db.ts`, `src/components/reviews/`):
- Only signed-in customers with a real order can post. Unpaid, unconfirmed-COD and cancelled orders don't count.
- Product reviews from someone who ordered that product get `verifiedBuyer`.
- A customer gets one live review per product, plus one of the boutique. This is enforced by the partial unique index `idx_reviews_one_live`, not just `hasExistingReview`: `createReview` returns `null` and restoring returns `"conflict"` when it would break the rule.
- There is deliberately **no approval step**: reviews go live as `approved` immediately, so good and bad reviews are both published.
- The owner can post a public `reply`, or set a review to `removed`, but only with one of `REVIEW_REMOVAL_REASONS` (never for a low rating). A removed review can be restored, and rows are never deleted.
- POST `/api/reviews` rate-limits right after auth, so refused attempts count too.
- Review photos are sent `private, max-age=300` so a removal takes effect quickly. Don't make them `public`.
- The home page, product page and `/review` show live reviews from `/api/reviews`. "Highest Rated" sorting uses `/api/reviews/summary`. The `rating`/`reviews` numbers on the product records are old seed data and must not be displayed or sorted on.
- Limits shared by the form and the server live in `review-policy.ts`.

**Storefront content** such as store phone, socials and the WhatsApp Channel link is in `src/lib/site-contact.ts`. Catalog reads go through `src/lib/catalog-store.ts`.

## Gotchas

- `main` auto-deploys to the live store. Never commit local demo tweaks. For example, `WHATSAPP_CHANNEL_URL` in `site-contact.ts` must stay `""` until the owner gives the real link, because a non-empty value turns on "Follow on WhatsApp" buttons site-wide.
- Production is PostgreSQL but `npm run dev` uses SQLite. Test new SQL in `db.ts` against a throwaway Postgres too (`initdb` + `pg_ctl` with `-c unix_socket_directories=''` and a TCP port, then run with `DATABASE_URL=postgresql://postgres@127.0.0.1:<port>/<db>`). Scripts run with `npx tsx` need a `.mts` extension to use top-level await.
- better-sqlite3 binds JS numbers as REAL, so build values like JSON paths (`$[0]`) in JS rather than concatenating a bound number in SQL.
- Rules like "one per customer" belong in a unique index, not check-then-insert. Detect violations with `isUniqueViolation`, which handles both databases.
- AGENTS.md is regenerated by `next dev` (currently with `##` headings). Commit the generated version instead of reverting it.
- Header.tsx has a known lint error (`set-state-in-effect`). Lint only the files you touched.

## Environment

See `.env.local.example`.
- Production requires `DATABASE_URL`, and `src/lib/env.ts` fails fast without it.
- The first owner account is seeded from `ADMIN_BOOTSTRAP_EMAIL`/`ADMIN_BOOTSTRAP_PASSWORD` only when `admin_users` is empty. Changing the variable later does nothing; use `admin:set-password`.
- Optional features turn off quietly when their variables are unset: Razorpay, Resend/SMTP, `WHATSAPP_*`, `COD_UPI_ID`, `SENTRY_DSN`.
- `GET /api/health` reports DB connectivity.
