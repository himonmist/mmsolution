import { execSync } from "node:child_process";

export const E2E_ADMIN = { email: "e2e-admin@test.local", password: "E2E-Strong-Pass-2026!" };
export default async function globalSetup() {
  const env = { ...process.env, DATABASE_URL: "postgresql://mm:mm_dev_pw@localhost:5432/mmsolution_test?schema=public" };
  execSync("npx prisma migrate deploy", { env, stdio: "inherit" });
  execSync(`psql "postgresql://mm:mm_dev_pw@localhost:5432/mmsolution_test" -c "DO \\$\\$ DECLARE r record; BEGIN FOR r IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename<>'_prisma_migrations' LOOP EXECUTE 'TRUNCATE ' || quote_ident(r.tablename) || ' CASCADE'; END LOOP; END \\$\\$;"`, { stdio: "inherit" });
  execSync("npx tsx prisma/seed.ts", { env: { ...env, SEED_ADMIN_EMAIL: E2E_ADMIN.email, SEED_ADMIN_PASSWORD: E2E_ADMIN.password }, stdio: "inherit" });
}
