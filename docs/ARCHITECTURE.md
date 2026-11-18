# Architecture

## Rendering
* Public pages are React Server Components that query PostgreSQL through Prisma (`src/lib/queries.ts`). Every request gets a fresh CSP nonce, so pages render dynamically; CMS edits appear immediately.
* Interactive islands are small client components: header/mega-menu, search dialog, inquiry modal, chatbot, project grid, 3D hero.

## 3D hero (performance budget)
* **No model downloads.** Every device (laptop, monitor, tower, server rack, switch, router, Wi-Fi AP, CCTV camera, UPS) is built from primitives in `src/components/three/models.tsx` (~25 KB gz incl. the scene). Lighting uses drei `Lightformer`s — no HDR fetch.
* The canvas is **lazy-loaded** (`next/dynamic`, `ssr:false`) after the SSR'd headline (LCP is text).
* GSAP ScrollTrigger maps scroll → `progress` ref; the R3F `useFrame` loop eases toward it and interpolates keyframes per scene (no React re-renders while scrolling). Captions/labels are updated via direct style writes; labels are projected 3D anchors in one DOM layer.
* `frameloop="never"` when the hero is off-screen (IntersectionObserver); DPR capped (1.75 desktop / 1.25 mobile); fewer particles and no AA on mobile.
* `prefers-reduced-motion` or no WebGL → static hero with a photograph and no pinned scroll; the product film degrades to a card grid.

Scenes: 1 Technology intro → 2 Computing (laptop + workstation, labels) → 3 Networking (rack, switch, router, AP, CCTV with live data links) → 4 Ecosystem ("One Partner. Complete IT Solutions.", camera pull-back, energy rings) → 5 recede into the product film.

## Database (PostgreSQL, normalised)
`roles` · `permissions` · `role_permissions` · `users` · `sessions` · `password_reset_tokens` · `product_categories` (self-referencing parent/children) · `product_brands` · `products` · `product_images` · `product_specifications` · `services` · `service_images` · `projects` · `project_images` · `testimonials` · `inquiries` · `inquiry_notes` · `pages` · `page_sections` · `banners` · `media_library` · `blog_posts` · `site_settings` (validated JSON per key) · `navigation_menus` · `activity_logs`.

All relations have foreign keys with explicit `onDelete` behaviour (`Restrict` for category→product, `SetNull` for optional links, `Cascade` for owned children) and indexes on every filter/sort path (`isPublished+sortOrder`, `status+createdAt`, FK columns). Bilingual readiness: `translations` JSON columns on content tables + `src/lib/i18n` UI dictionaries (English default, বাংলা toggle).

## CMS
* `src/lib/admin/fields.ts` declares each resource's fields once; `ResourceForm` renders them and `saveResourceAction` validates with the resource's Zod schema in `src/lib/services/content.ts`.
* Every write: permission check → Zod parse (unknown keys stripped) → sanitise → slug uniqueness → transaction → activity log → cache revalidation.

## Multilingual
`lang` cookie (`en` | `bn`) selects the UI dictionary and `<html lang>`; `tr()` reads Bangla overrides from `translations` columns. Add translated content by populating `translations.bn` (UI editor is the next increment).
