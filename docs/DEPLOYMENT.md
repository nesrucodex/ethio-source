# Deployment and integration guide

## Runtime and hosting

The web app is Next.js 16.3.5 / React 19.2.8 with App Router, using Bun for installs, development, builds, and serving. `bun.lock` is committed source material. Convex executes backend functions in its own runtime; Bun runs the Convex CLI.

Use a cloud Convex deployment for production. Local Convex at `127.0.0.1:3210` is only for development. Configure the real deployment with the Convex CLI and keep the generated URLs in `.env.local` locally and the hosting environment in production. Never ship a localhost URL to a hosted storefront.

For a Bun-capable server, install with `bun install --frozen-lockfile`, build with `bun run build`, and serve with `bun run start` behind an HTTPS reverse proxy. Hosting providers with native Next.js support can use their adapter with Bun as package manager; their server runtime may differ. No public deployment has been created by this implementation.

A Bun multi-stage `Dockerfile` is included and runs the Next.js standalone output as a non-root user. Supply the three public URL values as build arguments. The image does not include `.env` files or local Convex data. A Docker image build has not been verified in this environment.

Deploy the backend with `bunx --bun convex deploy`, using the correct project. Provision production signing keys once with the auth setup approach; never copy local development keys into production. Set `SITE_URL` to the HTTPS storefront URL. Configure public variables before building the web app:

- `NEXT_PUBLIC_CONVEX_URL`: cloud deployment's client URL.
- `NEXT_PUBLIC_CONVEX_SITE_URL`: cloud HTTP actions URL, useful for operator setup.
- `NEXT_PUBLIC_SITE_URL`: canonical storefront URL.

`src/config/env.ts` validates the public values. Secret variables are only on Convex. The required payment configuration is validated by `convex/env.ts`.

## Vercel and Convex quickstart

The app uses Convex for persistent data, realtime subscriptions, authentication, and uploaded files. Vercel hosts Next.js. You do not need another database or to override Convex's built-in `CONVEX_CLOUD_URL` / `CONVEX_SITE_URL` settings shown in the dashboard.

The configured cloud **development** deployment is `stoic-gerbil-925` in project `ethio-source`. Its backend and original local data have been deployed, including accounts, admin roles, catalog, and uploaded files. It persists independently of your laptop. The supplied development key cannot deploy a separate production database.

1. In the Convex dashboard, create/select the project's **Production** deployment. Generate its production deploy key with deployment permission. Keep it in a password manager and Vercel; never commit it or prefix it with `NEXT_PUBLIC_`. Revoke and replace the development key shared in chat, and update `.env.local` with its replacement.
2. Push this Git repository to your Git hosting account and import it at Vercel. The repository currently has no remote configured. Select the Next.js framework; `vercel.json` supplies the install and build commands.
3. Add these Vercel variables, scoped to **Production**:

   | Variable | Value |
   | --- | --- |
   | `CONVEX_DEPLOY_KEY` | Production deploy key from Convex |
   | `NEXT_PUBLIC_SITE_URL` | Canonical HTTPS Vercel/custom-domain URL |

   The build command `bun run build:vercel` runs `convex deploy --cmd 'bun run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL`. Convex supplies the matching database URL during the build. Do not hardcode the development URL in Vercel. `NEXT_PUBLIC_CONVEX_SITE_URL` is optional operator information; if set, use the production HTTP Actions URL.
4. For one-time production setup from your machine, create an ignored `.env.production.local` containing **all** of the following, replacing the placeholders:

   ```dotenv
   CONVEX_DEPLOYMENT=prod:YOUR-PRODUCTION-DEPLOYMENT
   CONVEX_DEPLOY_KEY=YOUR-PRODUCTION-DEPLOY-KEY
   NEXT_PUBLIC_CONVEX_URL=https://YOUR-PRODUCTION-DEPLOYMENT.convex.cloud
   NEXT_PUBLIC_CONVEX_SITE_URL=https://YOUR-PRODUCTION-DEPLOYMENT.convex.site
   NEXT_PUBLIC_SITE_URL=https://YOUR-VERCEL-PROJECT.vercel.app
   ```

   ```sh
   make deploy ENV_FILE=.env.production.local
   make auth-setup ENV_FILE=.env.production.local
   make site-url ENV_FILE=.env.production.local SITE_URL=https://YOUR-VERCEL-PROJECT.vercel.app
   make seed-admin ENV_FILE=.env.production.local
   ```

   `make deploy` deploys Convex and builds Next.js locally; it does not publish the frontend to Vercel. `make auth-setup` generates a fresh signing pair once, refuses to rotate existing keys, and aborts on access failures. Seed-admin prompts for credentials; there are no default passwords. Existing imported password accounts keep their passwords. Auth keys and integration environment variables are deployment-specific and are not included in data exports.
5. Deploy in Vercel. Verify sign-in, admin access, product updates from a second browser, and uploaded images. Changing public URLs requires rebuilding the frontend. Configure recovery, payment, and feed secrets directly on production Convex as described below.

For Vercel Preview, configure a separate development or preview key scoped only to Preview, plus its site URL and authentication configuration. Never expose production data to preview builds. The build script rejects a production key in Vercel Preview and a development key in Vercel Production.

This follows the official [Convex Vercel deployment guide](https://docs.convex.dev/production/hosting/vercel).

### Database migration and backups

Schema, indexes, and functions are deployed by `make cloud-push` for development and `make deploy` for a deployment selected by key. Existing records persist across code deployments. Data transfer is a separate explicit operation:

```sh
make backup SNAPSHOT=backups/cloud-dev.zip
make migrate ENV_FILE=.env.production.local SNAPSHOT=backups/cloud-dev.zip
```

Backups include file storage. Imports preserve IDs and references and refuse to overwrite nonempty tables; there are no automatic replacement flags. Run imports against an empty destination before seeding its admin or catalog. A full snapshot includes all accounts and authentication records: only migrate development records to production if you intend to retain them. Otherwise create a fresh production admin and approved catalog. Stop writes during the final export/import window so the destination does not miss changes. See [Convex snapshot import](https://docs.convex.dev/database/import-export/import).

`backups/`, `.env*` (except `.env.example`), and `.vercel/` are ignored by Git. Store a protected off-machine copy of backups. The initial local snapshot is `backups/local-before-cloud.zip`; `.env.local-backup` retains the old local connection. Neither was deleted by migration. To work against that local database again, restore those connection settings to `.env.local`, remove the cloud key from that file/environment, and start `make backend`.

The Makefile defaults to `.env.local`; pass `ENV_FILE=.env.production.local` deliberately for production. Keep every deployment's key and public URLs together in that file. A missing environment file fails before running a command.

## Authentication and recovery

Convex Auth owns password hashing, token generation, session refresh, and login throttling. Passwords require at least ten characters. Roles live in a separate `admins` table keyed by user ID. Customer queries filter by the authenticated user ID; no browser-supplied user ID is trusted for order ownership.

For password recovery, configure `AUTH_RESEND_KEY` and `AUTH_EMAIL_FROM` on Convex using a verified sender/domain. The `/reset-password` flow emails a random 128-bit code, valid for 15 minutes; the provider invalidates other sessions after a successful reset. Email verification at registration is not currently required. Complete sender setup and test recovery before enabling live sales. The UI deliberately avoids disclosing whether an email address exists.

## Chapa

The implementation follows the official [accept payments](https://developer.chapa.co/integrations/accept-payments), [verify payments](https://developer.chapa.co/integrations/verify-payments), and [webhook](https://developer.chapa.co/integrations/webhooks) documentation. It uses Chapa's v1 transaction initialize and verify endpoints.

Set these values on Convex (use stdin for secrets rather than shell history):

```sh
bunx --bun convex env set CHAPA_SECRET_KEY
bunx --bun convex env set CHAPA_WEBHOOK_SECRET
bunx --bun convex env set CHAPA_MODE test
bunx --bun convex env set SITE_URL https://your-store.example
```

`CHAPA_WEBHOOK_SECRET` must contain at least 16 characters. Register this URL in the Chapa dashboard:

```text
https://YOUR-DEPLOYMENT.convex.site/payments/chapa/webhook
```

The same webhook secret must be configured on both sides. The handler verifies `x-chapa-signature` as an HMAC-SHA256 over the raw request body before processing. It then fetches authoritative transaction details. It validates reference, mode, amount, currency, and success status. An invalid signature returns 401. Transient verification failures return non-success so the provider can retry. The callback endpoint also re-verifies via Chapa; query parameters cannot directly confirm an order.

The checkout URL returned by Chapa must be HTTPS under `chapa.co`. The browser redirects there only after the backend creates an order using server-side price, margin, delivery, and inventory rules.

Reservation expiry releases inventory after 30 minutes. A payment arriving afterward is flagged for review. Payments already marked paid or review are idempotent. Shipment transitions require verified payment. Manual review/refunds require a human merchant action; never mark an order paid just because a customer provides a receipt or returns from a checkout page.

Provider test credentials were not supplied, so no real Chapa transaction has been initialized, paid, refunded, or verified. Run the full merchant sandbox round trip, retry callbacks, validate current API response shapes, and confirm supported local payment methods before switching `CHAPA_MODE` to `live` with matching live credentials. The schema fails closed if the provider omits expected verification fields.

## Supplier feed contract

The supplier is undecided. No vendor-specific connector is claimed. A configurable HTTPS JSON feed adapter is implemented, with an optional bearer token:

- `SUPPLIER_FEED_URL`
- `SUPPLIER_API_KEY`

Expected response (maximum 200 products per sync):

```json
{
  "products": [{
    "supplierId": "supplier-sku-123",
    "slug": "everyday-canvas-tote",
    "name": {"en": "Canvas tote", "am": "የሸራ ቦርሳ", "om": "Boorsaa"},
    "description": {"en": "Description", "am": "መግለጫ", "om": "Ibsa"},
    "category": "fashion",
    "sourcePrice": 8,
    "currency": "USD",
    "stock": 40,
    "image": "https://images.unsplash.com/photo-1544816155-12df9643f363",
    "featured": false
  }]
}
```

Optional `images` is an array of up to seven additional HTTPS Unsplash URLs. `image` remains the primary photo. Omitting `images` leaves an existing gallery unchanged; send `images: []` to clear it.

Categories: `electronics`, `fashion`, `home`, `beauty`. Currency: `USD` or `CNY`. `stock` means total physical warehouse stock, not stock minus EthioSource reservations. Missing products are left unchanged; send `stock: 0` explicitly to mark unavailable. Invalid feeds preserve existing data and record an error. Slug collisions fail the batch rather than overwrite unrelated products. Supplier photos require adding the supplier CDN to backend validation and Next.js image allowlists; the sample setup allows only `images.unsplash.com`.

The feed runs daily at 02:00 UTC and can be triggered by an admin. Convex clients update immediately after ingestion. Truly immediate warehouse changes require a supplier event/webhook contract, which remains pending selection of that provider. Do not describe daily polling as instantaneous warehouse synchronization.

## Exchange feed

Configure `EXCHANGE_FEED_URL` and optionally `EXCHANGE_API_KEY`. Expected HTTPS JSON response:

```json
{"usd": 150, "cny": 21}
```

Both are positive ETB-per-source-currency rates. These example values are sample data, not current market rates. The daily 01:00 UTC update preserves the store margin and changes future catalog/checkout prices. Historical order totals remain fixed. Admins can override both rates and margin, and all changes are reactive. Agree on a licensed rate provider and acceptable stale-rate behavior before launch.

## Progressive web app

One web codebase serves phone, tablet, desktop, customer, and admin views. `/manifest.webmanifest` provides standalone display and icons. `/install` explains Android, iOS, and desktop installation, with an install button when the browser provides an install event. Safari uses Share → Add to Home Screen. Serve over HTTPS.

`public/sw.js` caches only the offline document and app icons. It never stores account pages, orders, API calls, or payment responses. Navigation uses the network and shows the reconnect screen on network failure. No background checkout, queued payments, or push notification service is included. The shopping bag persists locally through Zustand. Update the offline cache version when changing cached assets.

## Operational readiness

- Replace sample catalog and exchange rates with approved data.
- Publish actual support contact, privacy terms, retention/deletion procedures, delivery/customs rules, and return/refund policy.
- Configure email recovery and merchant sandbox tests.
- Test customer and administrator accounts using different browser sessions.
- Enable Convex backups and operational monitoring; review sync logs and payments in `review` status.
- Extend bounded list queries with pagination before exceeding current caps.
- Use the merchant dashboard for refunds and reconcile ledger totals with the payment provider.
- Arrange post-launch support with an operator; ongoing maintenance cannot be delivered by a one-time source-code change.
