import { prisma } from "@/lib/db";
import { ROLES, ROLE_LABELS } from "@/lib/auth/rbac";
import { hashPassword } from "@/lib/security/password";

export async function resetDb() {
  const tables = await prisma.$queryRawUnsafe<{ tablename: string }[]>(
    `SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> '_prisma_migrations'`);
  if (!process.env.DATABASE_URL?.includes("_test")) throw new Error("Refusing to truncate a non-test database");
  await prisma.$executeRawUnsafe(`TRUNCATE ${tables.map((t) => `"${t.tablename}"`).join(",")} CASCADE`);
}

export async function makeUser(role: (typeof ROLES)[number] = "super_admin", email = `${role}@test.local`, password = "Blue-Rack-Switch-42") {
  const r = await prisma.role.upsert({ where: { key: role }, update: {}, create: { key: role, name: ROLE_LABELS[role] } });
  return prisma.user.create({ data: { email, name: role, passwordHash: await hashPassword(password), roleId: r.id } });
}
