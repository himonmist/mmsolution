# MM Business Solution — Corporate Website, Product Catalogue & CMS

**Smarter IT | Better Business**

A premium corporate website for MM Business Solution (Bangladesh): a WebGL scroll-driven 3D hero, an Apple-style product film, a full product catalogue with inquiry workflow (**no cart/checkout by design**) and a role-based CMS at `/admin`.

| | |
|---|---|
| Frontend | Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Three.js / React Three Fiber · GSAP ScrollTrigger · Framer Motion |
| Backend | Next.js route handlers + server actions · PostgreSQL 16 · Prisma 6 · Zod |
| Security | Nonce CSP, hardened headers, opaque DB sessions, bcrypt, RBAC, rate limiting, CSRF origin checks, upload re-encoding, HTML sanitisation |
| Tests | 85 Vitest unit/integration tests (real Postgres) + 22 Playwright E2E tests |

## Quick start (development)

```bash
cp .env.example .env            # set DATABASE_URL and SEED_ADMIN_* values
npm install
npx prisma migrate deploy
npm run db:seed                 # roles, first super admin, sample content
npm run dev                     # http://localhost:3000  ·  CMS: /admin
```

## Tests (TDD workflow)

```bash
npm run db:test:prepare         # migrate the separate *_test database (see .env.test)
npm test                        # unit + integration (Vitest)
npm run build && npm run test:e2e   # E2E against a production build (Playwright)
```

Integration tests refuse to truncate any database whose URL does not contain `_test`.

## Project map

```
prisma/              schema.prisma, migrations, seed.ts
src/app/(site)/      public pages (home, products, solutions, projects, news, contact, quote, legal…)
src/app/admin/       CMS: (auth) login/reset · (panel) dashboard & management screens · actions.ts
src/app/api/         inquiries, search, chat (public, rate-limited)
src/components/three 3D models (procedural), HeroScene, Studio renderer
src/lib/security/    password, tokens, rate-limit, sanitize, csv, upload, origin, url
src/lib/services/    auth, inquiries, content, media, chatbot, activity  (business logic, unit-tested)
tests/               unit/ integration/ e2e/
deploy/              nginx, entrypoint, backup script
docs/                ARCHITECTURE · SECURITY · DEPLOYMENT · ADMIN_GUIDE
```

## Brand assets

`public/brand/logo.png` / `logo-reverse.png` were extracted from the supplied screenshot (a share-icon overlay was removed; the reverse version recolours the navy wordmark to white for dark backgrounds). **Replace them with the original vector/PNG logo files before launch.**
Product photos in `public/media/` are the three images supplied. `public/media/studio/*.webp` are renders of the site's own procedural 3D models (`npm run render:studio` with the dev server running).

## Content honesty

Seeded products and projects are flagged **Sample** on the site, carry no prices, specifications or availability, and testimonials are empty. Statistics show only live catalogue counts unless the team enters verified figures. Replace or unpublish sample content and confirm the brand list before launch — see `docs/ADMIN_GUIDE.md`.
