# Deployment

## Option A — Docker Compose (recommended)
```bash
git clone <repo> && cd mmsolution
cat > .env <<'ENV'
POSTGRES_PASSWORD=<long-random>
SITE_URL=https://www.your-domain.com
IP_HASH_SALT=<long-random>
SMTP_URL=smtps://user:pass@smtp.your-provider.com:465
MAIL_FROM="MM Business Solution <no-reply@your-domain.com>"
ENV
# TLS: place fullchain.pem / privkey.pem in deploy/nginx/certs (or use Cloudflare origin certs)
# Edit server_name in deploy/nginx/nginx.conf
docker compose up -d --build
# First admin + sample content (run once):
docker compose run --rm -e SEED_ADMIN_EMAIL=you@your-domain.com -e SEED_ADMIN_PASSWORD='<strong>' app \
  node -e "require('child_process').execSync('npx tsx prisma/seed.ts',{stdio:'inherit'})"
```
Migrations run automatically on container start (`deploy/scripts/entrypoint.sh`). The app container is read-only, non-root, all capabilities dropped. Uploaded media live in the `uploads` volume.

> Seeding from inside the slim image requires dev dependencies; alternatively run `npm run db:seed` from a workstation pointed at the production `DATABASE_URL` over an SSH tunnel.

## Option B — Node + systemd (VPS)
```bash
npm ci && npx prisma migrate deploy && npm run build
cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
NODE_ENV=production node .next/standalone/server.js   # behind Nginx (deploy/nginx)
```

## Cloudflare
DNS proxied (orange cloud) · SSL mode **Full (strict)** · Always Use HTTPS · WAF managed rules · rate-limit rule for `/api/*` and `/admin/login` · cache rule: bypass for `/admin*` and `/api*`.

## Backups
The `backup` service writes a compressed `pg_dump` nightly to `./backups` (14-day retention). Sync that folder off-site (rclone to S3/B2/Drive). Restore:
```bash
docker compose exec -T db pg_restore -U mm -d mmsolution --clean --if-exists < backups/<file>.dump
```
Also back up the `uploads` volume.

## Analytics & Search Console
Admin → Site settings → Integrations: GA4 measurement ID (`G-…`) and Search Console verification token. Submit `https://your-domain/sitemap.xml` in Search Console.

## Media storage
Uploads are stored on disk via `src/lib/services/media.ts`. To use Cloudinary/S3, replace the `writeFile` call with the provider SDK and return the CDN URL (also allow its host in `next.config.ts` → `images.remotePatterns` and CSP `img-src`, which already permits `https:`).
