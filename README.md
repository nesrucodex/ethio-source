# EthioSource

Production: [ethio-source.vercel.app](https://ethio-source.vercel.app)

A responsive Next.js storefront and protected admin dashboard for cross-border shopping from China to Ethiopia. Uses Bun, Convex, Zustand, shadcn/ui, and Motion. Built from the official `create-next-app` starter. The web app supports home-screen installation as a PWA; native mobile apps are intentionally excluded from the current scope.

## Run locally

Requires Bun 1.3.14 or newer.

```sh
make install
cp .env.example .env.local
```

Add your development `CONVEX_DEPLOY_KEY` to the ignored `.env.local` (or authenticate with the Convex CLI). The example selects the persistent cloud development database `stoic-gerbil-925`. If `.env.local` already exists, keep it instead of copying over it.

```sh
make cloud-push
make dev
```

Open http://localhost:3000. Run `make backend` in another terminal when editing backend functions; cloud data remains available when your computer is off. `make auth-setup` is only for a fresh deployment without signing keys, and refuses to replace existing keys. `make seed-demo` optionally adds illustrative catalog data to a fresh database.

The original local database and uploaded files were migrated to the cloud development deployment. Local rollback settings are retained in ignored `.env.local-backup`; the ignored snapshot is `backups/local-before-cloud.zip`. Existing accounts and admin roles were preserved. Sign in again after switching databases.

Without a Convex URL the storefront shows a preview collection; accounts and checkout are disabled. Sample prices and stock are not a live supplier feed.

## Deploy to Vercel

See [the Vercel and Convex setup](docs/DEPLOYMENT.md#vercel-and-convex-quickstart) for exact production environment variables and first-time setup. `vercel.json` builds the frontend with the URL supplied by Convex and deploys the backend. Run `make help` for deployment, migration, and backup commands. Production uses a separate Convex production deployment and key; the current cloud deployment is development.

## Administrator access

Deploy the backend functions, then seed an administrator:

```sh
bun run seed:admin
```

The script prompts for an email and a hidden password (at least 10 characters). You can also supply the email and name:

```sh
bun run seed:admin --email you@example.com --name "Store Administrator"
```

For automation, set `ADMIN_EMAIL`, `ADMIN_NAME`, and `ADMIN_PASSWORD` in your gitignored `.env.local`, then run `bun run seed:admin`. Remove the seed password from the file afterward. Never use `NEXT_PUBLIC_` for a password.

The script creates a real Convex Auth password account, then grants its admin role using an internal operator-only function. Rerunning for an existing password account preserves its password and grants the role idempotently. It targets the deployment selected by `.env.local` and requires Convex CLI access. Sign in at `/sign-in`, then visit `/admin`.

`InvalidAccountId` during sign-in means the connected deployment has no password account for that email. A `users` row alone does not create login credentials. Seed the administrator or register through `/sign-up`; also check that `.env.local` points to the intended database. There are no default administrator credentials.

For user-ID based role management:

```sh
bunx --bun convex run users:grantAdmin '{"userId":"YOUR_USER_ID"}'
bunx --bun convex run users:revokeAdmin '{"userId":"YOUR_USER_ID"}'
```

These functions and the seed lookup are internal: browser clients cannot invoke them. All admin reads and writes enforce permissions inside Convex.

## Features

- Customer routes at `/`, `/products`, `/products/[slug]`, `/cart`, `/checkout`, `/orders`, and `/account` under the `(client)` route group.
- Admin routes under `(admin)/admin`: overview, product management, orders/cargo, payment ledger, and exchange/integration settings.
- Product names, descriptions, categories, navigation, and cart labels in English, Amharic, and Afaan Oromoo. Operational, authentication, admin, and policy copy remains English; translations need native-speaker review before launch.
- Search, category filtering, price sorting, stock visibility, quantity controls, and persisted cart/language state.
- Password authentication, password-reset flow, server-enforced customer order privacy, and administrator roles. Password reset requires a configured Resend sender.
- Server-priced checkout with 30-minute inventory reservations. Only authenticated Chapa verification can confirm payments. Duplicate notifications do not deduct stock twice. Late payments and inventory conflicts enter manual review.
- Realtime cargo stages: confirmed → shipped from China → customs → ready for pickup. Admins advance one stage at a time with a tracking note.
- USD/CNY-to-ETB conversion, store margin, daily configurable exchange and supplier feeds, and sync logs.
- PWA manifest, install guidance, home-screen icons, and offline reconnect screen. Account/order/payment responses are never cached by the service worker. Shopping and payment require connectivity.

## Verification

```sh
bun run typecheck
bun run lint
bun run test
bun run build
bun run test:e2e
```

Browser tests require both development servers. Playwright uses `/opt/google/chrome/chrome` by default in this environment; set `PLAYWRIGHT_CHROME_PATH` to another browser executable. Tests create local customer accounts. Backend tests use an isolated in-memory Convex harness and fake payment-provider responses; they do not move money.

For production serving:

```sh
bun run build
bun run start
```

The PWA service worker is registered only in production mode. Installability requires HTTPS, except localhost. Visit `/install` for browser-specific instructions.

## Project structure

```text
src/app/(client)/         Storefront routes
src/app/(admin)/admin/    Admin routes
src/components/ui/       shadcn primitives
src/components/shared/   Navigation, states, PWA
src/components/storefront/
src/components/admin/
src/config/env.ts        Typed public environment configuration
src/stores/shop.ts       Persisted Zustand state
src/lib/                 Locales, shared commerce rules, sample catalog
src/services/api/        Chapa integration
convex/                  Schema, auth, authorization, commerce, feeds, crons, webhooks
public/                  PWA assets and offline screen
scripts/                 Local setup utilities
tests/                  Backend and browser verification
```

## Before live launch

See [Deployment and integrations](docs/DEPLOYMENT.md) for merchant setup, feed contracts, environment variables, and hosting. The remaining external dependencies are Chapa credentials and webhook validation in merchant test mode, the chosen supplier API, an exchange-rate source, email credentials, an HTTPS host/domain, and approved delivery/returns/privacy terms. Direct Telebirr/CBE Birr and Arifpay integrations are not implemented; Chapa is the selected first gateway. Payment methods offered inside Chapa depend on the merchant configuration.

Shipping is currently a business assumption: 450 Br, free from 15,000 Br. Confirm taxes, customs duties, delivery coverage, handling fees, and promised timing before selling. Sample product photos are illustrative Unsplash images, not verified supplier photos. Refunds are handled in the merchant dashboard; the application flags payments requiring review but does not automate refunds. Product and admin lists currently cap results at 200; customer order history caps at 100. Add pagination before growing beyond these limits.

### Product photos and workspace

The admin sidebar can collapse to icons on desktop and hide navigation on mobile. Its preference is remembered in a cookie. Product search matches names, categories, and slugs.

The product drawer includes a visual photo editor. Choose or drop local JPG, PNG, WebP, or AVIF files (up to 8 MB each), or add a direct public HTTPS image URL. Preview up to eight photos, choose a cover, reorder, remove, and retry failed uploads. Save is enabled when every photo is ready. Existing single-photo products need no changes.

Local files use Convex storage with administrator-only upload endpoints. The database keeps storage IDs and resolves URLs when reading products and order history. Unsaved registered uploads are removed after 24 hours. Previously saved files are retained so existing order snapshots continue to work. External image URLs load directly in the browser; the Next.js image proxy remains restricted to Unsplash.

The storefront leads with real catalog products and a China–Ethiopia identity in green, red, and gold. A dedicated section after the collection explains Birr payments, order tracking, and language support, followed by departments, ordering steps, and accessible FAQs. Browse eight departments from the landing page or open the Filters drawer in the catalog to choose a category and sort by featured products or price. New departments appear empty until products are assigned to them in the admin product form.

Administrators can open **Users** in the workspace sidebar to view paginated account details, customer/admin roles, and email/phone verification status. Search covers loaded accounts; use **Load more users** to extend the list. Verification status comes from account records and does not indicate whether a person is online. This directory is read-only and restricted to administrators on the backend.
