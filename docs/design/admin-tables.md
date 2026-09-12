# Admin tables

## User and context
Store administrators scan products, transactions, customers and integration activity on desktop, with mobile access for quick checks. Preserve compact controls, warm neutral surfaces, green accents, Lucide icons and existing admin authorization.

## Flow: Browse and act
### Overview
Entry: /admin and its products, orders, payments, users and settings subpages. Goal: compare records and reach older data without an expanding page.
### Steps
Load a first batch → scan a table → Previous/Next → edit product or inspect order in a right drawer → close and return to the triggering control. Payment tabs reset pagination and query the selected status on the server. Product/user search explicitly searches loaded records; next batches remain accessible even when no loaded records match.
### States and recovery
First load: existing labelled skeleton. Empty: explanatory full-width table row. Next batch: disabled pagination and loading label. Last page: Next disabled. Live updates: clamp displayed page to available rows. Query failures: existing route error boundary; Convex reconnects transient network failures. Mutations retain inline errors/toasts and prevent duplicate submission. Refresh returns to page one.

## Component: AdminTable
### Purpose and composition
Compose existing shadcn Table and Button primitives. Accept typed rows, stable row keys, column definitions (label, cell renderer, alignment), accessible caption, empty message, page size, optional load-more callback and loading state. Local pagination owns only the visible page. Consumers own fetching, filters and mutations. No table framework dependency.
### Styling rules
Rounded 1rem neutral surface, subtle horizontal dividers, muted header, compact rows, tabular right-aligned amounts, quiet hover feedback. No decorative icons or row-scale animation.
### Responsive behavior and accessibility
Native table/header semantics, caption for screen readers, horizontally scrollable container on narrow screens, wrapping long notes, clearly named row actions. Pagination stays outside horizontal scrolling and wraps at narrow widths. Native disabled buttons and polite page announcements. Focus stays on pagination during page changes; drawers restore trigger focus. Coarse-pointer action targets at least 44px; respect global reduced-motion settings.
### Implementation target
Next.js App Router client components using existing Convex hooks. Backend pagination uses admin-protected indexed queries, bounded batches and explicit validators. Dashboard remains a labelled latest-200 snapshot with an eight-order preview linking to the full paginated list.
### Acceptance criteria
All six admin surfaces reuse the table. No long list is permanently capped. Next/Previous, filtered empty states, final-page boundaries and mobile overflow work. Existing edit/upload/cargo actions survive the conversion. Typecheck, lint, backend pagination authorization tests and browser table checks pass.
