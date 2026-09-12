<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Form presentation

Use right-side shadcn Sheets for forms opened over a page. Keep dialogs for confirmations and brief alerts. Keep full-page and inline forms in their existing contexts. Drawer forms should have a scrollable body and visible actions on small screens.

## Interface and React conventions

Follow the apple-design, vercel-composition-patterns, and vercel-react-best-practices skills for interface work. Retain the warm green identity, use system typography and restrained depth, support reduced motion and keyboard interaction, and prefer small composed components with locally owned interaction state.

## Loading states

Compose loading views from `src/components/shared/loading.tsx` and the shared Skeleton primitive. Match the destination layout, keep placeholders hidden from assistive technology behind a labelled loading status, and respect reduced motion. Treat undefined query results as loading; do not show zero metrics or empty lists until data has arrived.

## Grouped form rows

Compose related inputs with `FormSection` from `src/components/shared/form-section.tsx` and existing `Field` / `FieldLabel` primitives. Use one rounded surface, inset dividers, labels beside simple controls, and stacked textareas. Keep help text and form actions outside the group, retain per-field language tabs, and preserve visible keyboard focus.

## Translated forms

Use `TranslatedInput` and `TranslatedTextarea` from `src/components/shared/language-fields.tsx`. Each field owns independent language tabs. Preserve every language in FormData, reveal missing required translations, and focus the first invalid field in the form.

## Icons

Use the existing `lucide-react` SVG icon library for interface icons. Never use emoji or Unicode symbols as icon substitutes, including directional arrows. Never use sparkle icons or decorative magic/AI motifs. Choose literal, purpose-specific icons instead. Keep decorative icons hidden from assistive technology and label icon-only controls.

## Search and filters

Compose list controls with `FilterToolbar` and `SearchField` from `src/components/shared/collection-controls.tsx`. Keep related search and filter controls adjacent, with shared sizing and focus styling; let callers own query and filter state. Avoid page-specific space-between toolbars.

## Density

Use compact desktop controls (`--control-height`) and list/menu rows (`--menu-row-height`) with restrained card and workspace padding. Retain larger targets on coarse-pointer devices and readable input text. Change shared components or tokens rather than shrinking the root font size or applying page zoom.

## Admin tables

Use `AdminTable` from `src/components/admin/admin-table.tsx` for administrative record lists, with stable row keys, semantic columns and right-aligned numeric values. Long lists use admin-protected Convex pagination and shared Previous/Next controls. Keep row details and editing in right-side Sheets. Label searches scoped to loaded records explicitly; never imply a loaded subset is the entire database.

## Admin language

Keep every admin interface label, category name, message and date format in English, independent of the storefront locale. Storefront translation preferences remain intact. Retain translated product name/description fields because they author customer-facing content.

## Product direction: B2B sourcing

`REQUIREMENT.md` and `docs/architecture/b2b-*.md` define the target China-to-Ethiopia procurement model. The primary journey is inquiry → quotation → acceptance → procurement order → production/inspection/shipping/delivery. Catalog prices are indicative, MOQ is explicit, supplier costs are private, and accepted terms are immutable. Do not extend retail bag/checkout semantics as the new business model. Preserve existing retail records/payment reconciliation during the staged migration. The architecture documents are specifications, not proof that the workflows are implemented.
