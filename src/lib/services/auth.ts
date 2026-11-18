import { prisma } from "@/lib/db";
import { verifyPassword, hashPassword, checkPasswordPolicy, DUMMY_HASH } from "@/lib/security/password";
import { randomToken, sha256 } from "@/lib/security/tokens";
import { logActivity } from "./activity";
import type { RoleKey } from "@/lib/auth/rbac";

export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8h absolute
export const MAX_FAILED = 5;
const LOCK_MS = 15 * 60 * 1000;
const RESET_TTL_MS = 30 * 60 * 1000;
const GENERIC = "Invalid email or password.";

export type AuthUser = { id: string; email: string; name: string; role: RoleKey };

export async function authenticate(email: string, password: string, ip: string) {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() }, include: { role: true } });
  // Always run bcrypt to equalise timing between existing and unknown accounts.
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !user.isActive) return { ok: false as const, error: GENERIC };
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await logActivity(user.id, "login_blocked", "user", user.id, `Locked account login attempt from ${ip ? "client" : "unknown"}`);
    return { ok: false as const, error: GENERIC };
  }
  if (!valid) {
    const failed = user.failedLoginCount + 1;
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: failed >= MAX_FAILED ? 0 : failed, lockedUntil: failed >= MAX_FAILED ? new Date(Date.now() + LOCK_MS) : null },
    });
    await logActivity(user.id, "login_failed", "user", user.id);
    return { ok: false as const, error: GENERIC };
  }
  await prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() } });
  await logActivity(user.id, "login", "user", user.id);
  return { ok: true as const, user: { id: user.id, email: user.email, name: user.name, role: user.role.key as RoleKey } };
}

export async function createSession(userId: string, meta: { ip?: string; userAgent?: string }) {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({
    data: { tokenHash: sha256(token), userId, ip: meta.ip?.slice(0, 64), userAgent: meta.userAgent?.slice(0, 200), expiresAt },
  });
  // opportunistic cleanup
  await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return { token, expiresAt };
}

export async function validateSession(token: string | undefined | null): Promise<{ user: AuthUser; sessionId: string } | null> {
  if (!token || token.length < 32 || token.length > 100) return null;
  const s = await prisma.session.findUnique({ where: { tokenHash: sha256(token) }, include: { user: { include: { role: true } } } });
  if (!s || s.expiresAt < new Date() || !s.user.isActive) return null;
  if (s.createdAt < s.user.passwordChangedAt) return null;
  return { sessionId: s.id, user: { id: s.user.id, email: s.user.email, name: s.user.name, role: s.user.role.key as RoleKey } };
}

export async function destroySession(token: string) {
  await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } });
}

export async function requestPasswordReset(email: string): Promise<{ token?: string }> {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || !user.isActive) return {};
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  const token = randomToken(32);
  await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + RESET_TTL_MS) } });
  await logActivity(user.id, "password_reset_requested", "user", user.id);
  return { token };
}

export async function resetPassword(token: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
  const policy = checkPasswordPolicy(newPassword);
  if (!policy.ok) return { ok: false, error: policy.reason };
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!row || row.usedAt || row.expiresAt < new Date()) return { ok: false, error: "This reset link is invalid or has expired." };
  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash, passwordChangedAt: new Date(), failedLoginCount: 0, lockedUntil: null } }),
    prisma.session.deleteMany({ where: { userId: row.userId } }),
  ]);
  await logActivity(row.userId, "password_reset", "user", row.userId);
  return { ok: true };
}
