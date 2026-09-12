# EthioSource — China-to-Ethiopia B2B sourcing

This specification supersedes the [retail requirements](docs/archive/retail-requirements.md). The [complete business brief](docs/architecture/b2b-source-brief.txt) is retained as the source of scope. These documents describe the target system; the existing application has not yet been migrated to it.

## Product objective

Help Ethiopian businesses discover products manufactured or sourced in bulk in China, submit requirements, work with sourcing staff, agree to a quotation, exchange documents and track procurement through delivery. The China agent manages supplier relationships and sourcing information. Products are sourcing opportunities, not promises of warehouse stock or immediate delivery.

The primary journey is:

Discover → Evaluate MOQ and specifications → Submit inquiry → Clarify requirements → Receive quotation → Agree on terms → Complete required documents → Make requested payment → Production → Quality inspection → Shipping → Customs → Delivery → Completion.

**Request a quote** replaces **Add to bag** as the primary product action. A quotation is required before a procurement order exists. An indicative catalog price is never a binding payable total.

## Retained project decisions

- Next.js App Router, Bun, Convex and existing authentication; shadcn primitives and composed React components.
- Responsive web/PWA for customers, staff and China agents. Native apps remain future scope.
- Customer interface: English, Amharic and Afaan Oromoo. All staff/admin/agent interfaces: English. Per-field translation tabs edit customer-facing content.
- Compact shared tables, adjacent search and one filter drawer, grouped form rows, right-side drawers, accessible keyboard interaction and reduced motion.
- Ethiopian green with restrained Chinese red and shared gold accents. System typography; Lucide icons; no emoji, sparkle icons or decorative AI motifs.
- Chapa is the first automated payment adapter. Audited manual payment verification is a separate workflow. No supplier API is required to operate the initial agent-led business.

## Required product capabilities

1. Sourcing catalog: media, specifications, variants, MOQ, indicative prices and quantity tiers, customization, material/manufacturing information, production and shipping estimates, publication/availability status and last update. Supplier disclosure is explicit.
2. Discovery: category, price, MOQ and customization filters; sorting; saved products and comparison. Bulk quantities must meet MOQ and order increments.
3. Inquiries: product/variant, quantity, customization, optional budget, destination, requirements, attachments and conversation.
4. Quotations: private supplier offers, versioned customer offers, negotiation, validity dates, explicit acceptance and immutable accepted terms.
5. Procurement orders: quantities, agreed prices, documents, production, inspection, shipment/customs/delivery, payment schedule and event history.
6. Customer workspace: business profile, inquiries, quotations, next actions, orders, messages, saved products, documents, payments and notifications.
7. Staff workspace: operational queues, products/categories, suppliers, business accounts, customers, agents, quotations, orders, finance, documents, communication and settings. China agents have an assigned-work interface, not unrestricted admin access.
8. Documents: controlled upload, versions, viewing/download, status, transaction linkage, acknowledgement/signature evidence and audit history. Formal electronic signing depends on a chosen provider and business requirements.
9. Support: in-platform conversation and callback requests; show email/phone/Telegram only when configured. External conversations may be recorded manually; automatic synchronization is a later connector.
10. Server-enforced RBAC and resource-level access, append-only audit events, notification delivery infrastructure and operational metrics.

## Design package and implementation order

- [Architecture, permissions and workflows](docs/architecture/b2b-platform.md)
- [Database model, indexes and invariants](docs/architecture/b2b-data-model.md)
- [Interface and interaction specification](docs/architecture/b2b-experience.md)
- [Migration and acceptance plan](docs/architecture/b2b-delivery-plan.md)

Model and implement the complete inquiry-to-completion journey in vertical slices. Preserve existing accounts, retail transactions and payment reconciliation while introducing new procurement entities. Do not relabel retail orders as quotation-backed orders or invent MOQ, supplier promises or signatures for legacy records.

## Future expansion

Additional countries/agents, bidding, customer-specific price agreements, automated quotations, supplier integrations, logistics feeds, AI assistance, warehouses, external messaging delivery, native applications and Telegram Mini Apps are extension points. They are not prerequisites for the first functioning sourcing operation.
