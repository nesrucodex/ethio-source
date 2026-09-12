# Migration and acceptance plan

## Current implementation versus target

| Existing implementation | Reuse | Required change |
|---|---|---|
| Next.js/Bun, Convex Auth, PWA | Runtime, authentication, responsive shell | Add customer-account membership and staff permissions; private business data stays out of service-worker caches |
| `products` with sourcePrice, stock, reserved | IDs, translated names/descriptions, image references | Add sourcing fields with optional validators; reviewed MOQ/tiers/specifications required before sourcing publication |
| Boolean `admins` access | Preserve existing operator access during transition | Explicitly reviewed staff role migration; assigned-resource authorization for agents/support |
| Product editor and photo storage | Grouped forms, language fields, upload preview | Add variant/spec/tier editing and video pipeline; private supplier/document storage is separate |
| AdminTable/filter drawers | Shared visuals, row actions, cursor-based batch access | Full-dataset authorized search/filter queries; replace loaded-only search/filter semantics |
| Retail cart, checkout and `orders.create` | Keep operational during staged migration | Remove from sourcing navigation; backend disables new retail order creation at cutover, not just UI |
| Existing `orders`, reservations, Chapa payment callbacks | Preserve historical records and reconciliation | New `procurementOrders`, payment requests and receipt ledger; do not mutate old order semantics |
| Retail cargo stage array | Existing history preserved read-only where appropriate | New milestone, inspection and shipment records with audit events |
| Exchange-rate settings | Provider configuration and indicative conversions | Accepted quote/order prices use immutable snapshots; labels distinguish estimated catalog values |
| User creation/directory | Auth account creation and table shell | Account/business membership, staff role management and global directory filters |
| Landing page and category discovery | Media components, responsive layout, shared style | Rewrite content and CTAs around sourcing/MOQ/quotes; no retail delivery promises |

## Phase 1 — Domain and access foundation

Implement account/membership, staff permissions/assignments, supplier/category records, audit writes and the first sourcing fields. Existing users/auth accounts remain unchanged. Create an idempotent migration with checkpoints and counts; make personal accounts and owner memberships for existing customers. Operator reviews staff mapping before roles are activated. Leave unaudited legacy products as sourcing drafts instead of manufacturing missing details.

Acceptance: authorization tests for all roles; no cross-account reads; no public supplier fields; repeat migration produces no duplicates; current retail flows still function. Add rollback switches before routing users to new screens. Obtain a deployment backup/export through the configured operator workflow before data migration.

## Phase 2 — Discovery and inquiry vertical slice

Implement sourcing catalog projections, full-dataset filters/search, informative details, bulk quantity controls, save/compare, customer business profile, inquiry submission and attachments, staff/agent inquiry queues and customer conversations. Provide configured support contacts and callback requests. Add in-app events for inquiry submission/replies. The first complete slice ends with a persisted inquiry that staff can respond to and the customer can view.

Acceptance: MOQ/increment enforcement, no fabricated prices/lead times, private attachments remain private, duplicate submission is idempotent, unauthenticated draft returns after sign-in, agent cannot access unassigned customer requests. Test new filters against matching records beyond the first batch.

## Phase 3 — Supplier offers and customer quotations

Implement internal supplier profiles/offers, quote drafting/release/versioning/expiry, negotiation messages, acceptance, document versioning and execution requests. Clearly disclose which document actions are acknowledgements and which rely on a configured signing provider. Do not hold quotation negotiation hostage to an unconfigured external channel.

Acceptance: customers cannot read supplier costs; released versions immutable; stale/expired/superseded acceptance rejected; concurrent acceptance creates one acceptance; required signer authorization tested; superseded document version cannot satisfy a new signature requirement.

## Phase 4 — Procurement and finance

Convert accepted quotes to procurement orders with immutable snapshots, payment schedules, document/payment gates, provider-neutral payment attempts, manual evidence review and Chapa verification. Keep retail and procurement webhook references distinguishable; route by stored provider attempt, not untrusted event text. Add production, rework, inspections, partial shipments, customs, delivery and completion. Record all transitions, actor, reasons and evidence.

Acceptance: exactly one order per acceptance; no self-verification of manual evidence; repeated provider events credit once; wrong currency/amount/late receipts go to review; partial allocations and reversals reconcile; orders do not silently proceed past blocked gates; cancellation never implies refund. Existing retail payment callbacks continue to settle their original orders.

## Phase 5 — Sourcing cutover and operational completeness

Switch landing, navigation and primary product actions to sourcing. Disable new retail checkout server-side with a clear migration response, while maintaining legacy order reads and outstanding payment reconciliation. Existing bags offer a product-list-to-inquiry action; never automatically submit inquiries, accept MOQ changes or charge customers. Use separate legacy routes/sections where necessary so past orders remain accessible.

Complete role-specific dashboards, notifications/read states, document tasks, support queues, audit viewer and operational metrics with documented definitions. Configure retention and backup operations. Provide staff workflows for failed uploads, expired quotes, supplier unavailability, payment review and delayed production.

Acceptance: end-to-end buyer inquiry → staff clarification → supplier offer → released quote → acceptance → required documents/payment → production → inspection → shipping → delivery → completion. Cover customer/support/agent/operations/finance access with separate sessions. No dead bag/checkout links, misleading price promises or untranslated customer navigation. Staff interfaces remain English.

## Migration safety and rollback

1. Add optional fields and new tables/indexes first. Old readers remain compatible.
2. Run bounded, resumable backfills using cursor checkpoints and a migration version; validate record counts and sampled relationships.
3. Deploy new queries/mutations alongside legacy ones. New writes carry a domain version where needed. Avoid duplicate dual-writing of commercial orders.
4. Enable the sourcing journey behind a server-owned switch only after the required slice works. Disable retail creation through a backend guard at cutover.
5. Rollback changes routing and new-write admission, not accepted terms or existing history. Continue serving and reconciling already-created procurement records even if public admission is paused.
6. Remove obsolete retail UI only after historical access and outstanding callbacks are accounted for. Do not delete stored orders, receipts or audit evidence as a UI cleanup.

## Test matrix

| Area | Required evidence |
|---|---|
| RBAC | Role+assignment matrix, customer membership isolation, internal notes/files omitted from customer projection, last-super-admin guard |
| Commercial integrity | MOQ/increment rules, tier boundaries, integer currency math, quote expiry/revision/concurrency, one order per acceptance |
| Files | Invalid size/type, unscanned read denial, cross-account upload/link denial, version immutability, unauthorized download, signature replay |
| Finance | Duplicate/out-of-order events, wrong amount/currency, partial payment, manual reviewer separation, reversals, cancellation/refund distinction |
| History | Every protected mutation adds actor/resource/event atomically, rejection leaves no partial state, secrets excluded from audit |
| UI | Customer and each staff role, drawer focus, translated fields, mobile/large text, reduced motion, failure/retry/empty states, no global overflow |
| Scale | Authorized filters beyond first batch, bounded query reads, bounded histories, independent metrics totals, outbox retry/idempotency |
| Migration | Repeated backfill, interruption/resume, old retail reads/payments, admission switch rollback and legacy links |

## Decisions to resolve before affected integrations go live

These are configuration/commercial decisions, not reasons to revert to retail checkout:

- Operator/staff identities and assignment policy; who may release quotations and authorize commercial exceptions.
- Public support email/phone/Telegram and callback operating hours; show only configured channels.
- Deposit/balance policies, quote validity defaults, currencies, tax/customs/freight assumptions and inspection approval rules.
- Electronic-signing provider, required evidence and document retention policy. Until configured, acknowledge documents explicitly without claiming formal signing.
- Private-file size/type limits, malware scanning and streaming/download deployment approach.
- Chapa merchant activation and allowed manual payment evidence; never request secrets in chat.

Default first release: one China agent using assigned work, individual/personal accounts plus business accounts, in-app communication, human-prepared quotations and finance-reviewed payments. Additional agents, countries and providers extend these existing boundaries.
