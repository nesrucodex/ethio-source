# B2B experience specification

Target: Next.js App Router using existing shadcn components, shared tables, grouped form rows, filter drawers and labelled skeletons. This is an implementation handoff, not a claim that screens already exist.

## Users and context

Ethiopian buyers need enough evidence to judge a bulk purchase and understand their next action. China agents need dense, assigned-work queues and private supplier information. Operations coordinates offers and fulfillment; Finance needs independent verification. Responsive web serves all roles; staff UI stays English and customer UI retains three languages.

## Flow: Product to procurement

### Entry and prerequisites
Public landing/discovery routes lead to `/products/[slug]`. Browse, compare and evaluate without sign-in. Submitting an inquiry requires a customer account; preserve the draft through the sign-in return path. Do not store confidential attachments or documents in localStorage.

### Steps
1. **Discover:** sourcing-focused hero, categories, product evidence, MOQ and indicative unit ranges. Primary CTA “Explore sourcing products”; supporting CTA “Discuss a sourcing request.” Remove retail bag counts, retail shipping promises and instant-checkout language at the sourcing cutover.
2. **Evaluate:** product gallery, concise MOQ/unit-price/lead-time facts, variants, tier pricing, specifications, customization, material/manufacturing, shipping assumptions, last reviewed date and related products. Show “Contact us for pricing” or “Lead time to be confirmed” when missing. Display only approved supplier summary.
3. **Request:** right drawer collects product/variant, bulk quantity, customization, budget/currency optional, destination, requirements and reference attachments. Presets derive from MOQ/increment (not fixed 1/2/3). Larger requests can open a full workspace. Clarify “Requesting a quotation does not place an order.”
4. **Clarify:** customer sees reference, submitted requirements, current status, assigned support channel and a linked conversation. Show the next needed response; internal supplier discussions never appear.
5. **Review quote:** released version shows quantities, tier basis, currency, delivery/tax assumptions, validity, payment milestones and version changes. Distinct actions: accept terms, ask a question, request revision, decline. Expired/superseded offers remain readable with acceptance disabled.
6. **Proceed:** an accepted offer becomes a confirmed procurement order. Its overview prioritizes outstanding signatures/payment requests. Production gates explain what is required; do not imply production has begun because an offer was accepted.
7. **Track:** timeline shows actual completion timestamps, current active stage, expected dates labelled as estimates, blockers and next action. Partial shipments and reinspection are visible. Completion follows delivery confirmation and operational closeout.

### Exceptions and recovery
MOQ/increment errors appear beside quantity. Missing pricing allows an inquiry but never a fake total. Upload errors support retry/removal without losing other input. Permission loss shows an access message without exposing cached private data. Empty queues explain what will appear. Network loss preserves in-memory form input and blocks duplicate commands; backend idempotency handles retries. Concurrent quote updates require review of the current version. Closing a dirty substantial draft offers save/discard; short filter drawers close immediately. Failed payment returns to its payment request, not to a retail bag.

## Component: BulkQuantityField

Purpose: select a valid procurement quantity. Props: MOQ, increment, unit, optional upper bound/capacity, value and onChange. Native numeric input plus valid presets; no retail quantity defaults. Server and UI apply identical integer/increment rules. Presets are deduplicated and rounded to valid increments relative to MOQ. Below-MOQ quote requests require an explicitly supported exception flow.

State: empty/valid/invalid/disabled; inline error is linked with `aria-describedby`, control uses `aria-invalid`. Label includes unit; MOQ is persistent help. At mobile width presets wrap; input text remains readable. Keyboard users can type custom values without clicking preset buttons.

## Component: SourcingProductSummary

Purpose: compare commercial facts without opening every product. Data: title, category, approved image, MOQ, indicative range/currency, customization availability, lead-time range, review time, publication/sourcing availability. Compose ProductImage, evidence facts, save action and quote link. No claim of stock availability unless separately evidenced. Comparison supports at most four saved selections in the initial UI, with the same specification rows and an explicit “Not supplied” value for gaps.

## Component: ProcurementTimeline

Purpose: communicate actual progress and next action. Data: ordered milestone records, completion/estimate dates, public notes, blockers and optional related action. Use semantic ordered list; current step has `aria-current="step"`; status is written, not color-only. Vertical on mobile; compact grouped stages on desktop with expandable event detail. No looping progress animation. A cancelled/on-hold state remains prominent and does not render future stages as completed.

## Component: CommercialDocumentPanel

Purpose: discover versions and complete required review/signing. Data: accessible document metadata, version list, scan/status, required signer, execution state and permitted actions. Table/list inside detail page; preview in sheet or dedicated route; clearly distinguish download, acknowledgement and formal signature. Inaccessible files never render URLs. A version change explicitly invalidates outstanding requests for the old version where required, while retaining old evidence.

## Component: WorkQueue

Use existing AdminTable and shared toolbar. Columns prioritize reference, account/product, status, age/due date, assignee, next action; amount columns include currency and align right. Row minimums stay shared (48px desktop, 56px touch in current tokens); long content opens detail rather than unpredictably expanding every row. Queue filters are server-side and reset cursor on change. Pagination and loading/error/empty states remain outside horizontal scroll. User-specific filter state may use URL query parameters; private payloads must not.

## Routes and navigation

| Surface | Primary routes | Main actions |
|---|---|---|
| Public/customer discovery | `/`, `/products`, `/products/[slug]`, `/compare`, `/support` | Browse, save, compare, request quote/contact |
| Customer workspace | `/account`, `/account/business`, `/inquiries`, `/inquiries/[id]`, `/quotations/[id]`, `/orders`, `/orders/[id]`, `/documents`, `/messages`, `/notifications`, `/saved` | Respond, accept, sign/acknowledge, pay, track |
| Operations | `/admin` plus products/categories/suppliers/customers/agents/inquiries/quotations/orders/payments/documents/support/settings | Assigned operational queues and authorized actions |
| China agent | `/agent`, `/agent/products`, `/agent/suppliers`, `/agent/inquiries`, `/agent/orders` | Supplier coordination, product drafts, offers, production and inspection |

Reuse detail components with explicit public/staff projections, not a large component containing scattered role checks. Customer Support and Finance may use permitted sections of the staff workspace; navigation is derived from capabilities, backend access remains authoritative.

## Visual system

Use the existing warm neutral canvas, system font, compact controls, green primary actions and restrained red/gold accents. Typography expresses hierarchy through weight and spacing; commercial data is readable and aligned. One dominant action per context, with status and consequences near it. Avoid generic oversized hero claims and repeated decorative feature cards. Use genuine product/agent evidence and a clear China–Ethiopia workflow; do not fabricate testimonials, certifications or delivery guarantees.

Drawers enter/exit from the right, retain visible actions and scroll their bodies. Focus returns to the trigger. No new animation dependency; respect global reduced motion and visible focus. Use translucency only for useful layering with adequate contrast. Icons are Lucide and secondary to labels. Filter/search controls remain adjacent.

## Acceptance criteria

- MOQ, price basis and lead-time uncertainty are visible before inquiry submission.
- No public route displays private supplier costs, contacts or internal notes.
- A buyer can identify the next required action without interpreting staff-only statuses.
- All form inputs retain explicit labels, keyboard focus and inline error associations.
- Critical workflows work at 320px width and with larger text; tables scroll within their own region.
- Customer language preference survives staff navigation; all staff copy remains English.
- Screen readers distinguish estimate vs completion, quotation versions and signature method.
- Runtime checks cover authenticated roles, slow/failed requests, empty states, pagination and desktop/touch interactions.
