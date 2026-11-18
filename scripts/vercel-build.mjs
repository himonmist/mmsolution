// Vercel build: apply DB migrations (direct, unpooled connection), seed once, then build.
// Neon's Vercel integration provides DATABASE_URL (pooled) and DATABASE_URL_UNPOOLED (direct).
import { execSync } from "node:child_process";

const run = (cmd, extraEnv = {}) => execSync(cmd, { stdio: "inherit", env: { ...process.env, ...extraEnv } });
const direct = process.env.DATABASE_URL_UNPOOLED || process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!direct) throw new Error("DATABASE_URL is not set — add the Neon integration or set it in Vercel → Settings → Environment Variables.");

run("npx prisma migrate deploy", { DATABASE_URL: direct });
// Idempotent: creates roles, the first super admin (only if missing) and sample content (only if missing).
if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) run("npx tsx prisma/seed.ts", { DATABASE_URL: direct });
else console.log("[vercel-build] SEED_ADMIN_* not set — skipping seed.");
run("npx next build");
