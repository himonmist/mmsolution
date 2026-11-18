# Deploy on Vercel + Neon (≈10 minutes, free tiers)

The repo is pre-configured: `vercel.json` (Singapore region `sin1`, closest to Bangladesh), `npm run vercel-build` (runs DB migrations → seeds the first admin + sample content once → builds), Vercel Blob support for CMS uploads.

## 1. Import the project
1. Sign in at **vercel.com** with GitHub → **Add New… → Project** → import **himonmist/mmsolution**.
2. If the default branch is not yet merged, pick branch `claude/fervent-sagan-yl3hgc` (or merge it into `main` first).
3. Framework is detected as Next.js. **Don't deploy yet** — open *Environment Variables* first (step 3), or let the first deploy fail and redeploy after.

## 2. Add the database (Neon) and file storage (Blob)
In the project → **Storage** tab:
1. **Create Database → Neon (Serverless Postgres)** → region *AWS ap-southeast-1 (Singapore)* → connect to the project.
   This sets `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct) automatically.
2. **Create → Blob** → connect to the project. This sets `BLOB_READ_WRITE_TOKEN` so admin image uploads persist.

## 3. Environment variables (Settings → Environment Variables, Production)
| Name | Value |
|---|---|
| `IP_HASH_SALT` | any long random string |
| `SEED_ADMIN_EMAIL` | your admin email |
| `SEED_ADMIN_PASSWORD` | strong password (≥12 chars, upper/lower/number/symbol) |
| `SITE_URL` | *(optional)* `https://your-domain.com` once you add a domain — defaults to the `*.vercel.app` URL |
| `SMTP_URL`, `MAIL_FROM` | *(optional)* for password-reset emails |

## 4. Deploy
**Deployments → Redeploy** (or push to the branch). The build log shows `Applying migration…`, `Created super admin…`, `Seed complete.`
Open `https://<project>.vercel.app` — CMS at `/admin`.

After the first successful deploy, you can delete `SEED_ADMIN_PASSWORD` from Vercel (the seed never overwrites an existing admin) and change your password in the CMS.

## Notes
* **Upload size**: Vercel functions accept request bodies up to ~4.5 MB, so keep CMS images under 4 MB on Vercel (the app's own limit is 8 MB for VPS/Docker).
* **Rate limiting** is in-memory per serverless instance on Vercel; login lockout is stored in the database and still applies. For stronger limits enable *Vercel Firewall → Rate limiting* on `/api/*` and `/admin/login`, or use Upstash Redis.
* **Custom domain**: Project → Settings → Domains, then set `SITE_URL` and redeploy.
