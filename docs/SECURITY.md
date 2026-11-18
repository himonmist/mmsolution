# Security

No system can honestly be called "100 % secure". This application is built to the OWASP ASVS L2 / OWASP Top-10 baseline with tests for each control. Before launch, commission an independent penetration test and keep dependencies patched (`npm audit` runs in CI).

## Controls and where they are tested

| Threat | Control | Tests |
|---|---|---|
| XSS (stored/reflected) | React auto-escaping; CMS HTML sanitised with an allow-list **on write and on render** (`sanitize-html`, no `script/style/iframe/svg`, no `javascript:`/`data:` URLs, `rel=noopener` forced); inquiry fields stripped of tags; JSON-LD escaped | unit `security.test.ts`, integration `inquiry`, `catalog`; E2E admin renders `<img onerror>` payload inertly |
| Script injection fallback | Nonce-based CSP with `strict-dynamic`, no `unsafe-eval` in production, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'` | E2E `security.spec.ts` |
| CSRF | Session cookie `SameSite=Lax`; public JSON APIs require a same-origin `Origin` header and `application/json`; server actions have Next's built-in origin check | unit `isSameOrigin`; E2E cross-origin/no-origin/form posts refused |
| SQL injection | Prisma parameterised queries only; no raw SQL with user input | E2E injection string in search |
| Broken auth | bcrypt (cost 12); 12+ char policy, 72-byte cap; generic errors + constant-time dummy hash (no user enumeration); lockout after 5 failures (15 min) + IP & account rate limits; opaque 256-bit session tokens stored as SHA-256; 8 h absolute expiry; sessions revoked on logout, password change/reset and deactivation; `__Host-` HttpOnly Secure cookie | integration `auth.test.ts`; E2E cookie flags, forged & replayed cookies |
| Password reset | Single-use, 30-min, hashed tokens; generic response; rate-limited; all sessions revoked | integration `auth.test.ts` |
| Broken access control | RBAC matrix (`src/lib/auth/rbac.ts`) enforced in **services** (not just UI); middleware gate + server re-validation on every admin page/action | unit RBAC; integration permission tests; E2E content editor blocked |
| Mass assignment | Zod schemas strip unknown keys (e.g. public inquiry cannot set `status`/`assigneeId`) | unit + integration |
| File upload attacks | Size cap (8 MB), magic-byte sniffing (SVG rejected), full decode + **re-encode to WebP** with sharp (destroys polyglots, strips EXIF/GPS), pixel-bomb limit, random filenames, served with `nosniff` + `sandbox` CSP; strict path resolver | integration `upload.test.ts`; E2E traversal |
| Spam / abuse / DoS | Per-IP rate limits (forms, chat, search, login, reset), honeypot field, body-size limits (JSON 32 KB), Nginx `limit_req` and timeouts | integration rate-limit; E2E 413/400 |
| CSV/formula injection | Cells starting with `= + - @ \t \r` are prefixed | unit + integration export |
| Open redirect | Only relative internal paths accepted; banner/CTA links validated | unit `isSafeRedirect` |
| Clickjacking / sniffing / leakage | `X-Frame-Options: DENY`, `nosniff`, HSTS preload, strict Referrer-Policy, Permissions-Policy, COOP/CORP, no `X-Powered-By`; admin `no-store` + `noindex` | E2E headers |
| Privacy | IPs stored only as salted hashes; Facebook embed loads on explicit click | — |
| Auditability | `activity_logs` for logins, failures, lockouts, CRUD, exports | integration |

## Operational checklist
* Set strong `POSTGRES_PASSWORD`, unique `IP_HASH_SALT`, real `SITE_URL` (https).
* Change the seeded admin password on first login; create named accounts per staff member with least-privilege roles.
* Terminate TLS at Nginx/Cloudflare; enable Cloudflare WAF + Bot Fight Mode; restore real IPs (see `deploy/nginx/nginx.conf`).
* Multi-instance deployments: move the in-memory rate limiter to Redis (same interface in `src/lib/security/rate-limit.ts`).
* Keep off-site copies of `./backups` and test restores quarterly.
