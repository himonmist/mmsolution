import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { ensureSuperAdmin, authenticate, createSession, validateSession } from "@/lib/services/auth";
import { resetDb, makeUser } from "./helpers";

beforeEach(resetDb);

describe("ensureSuperAdmin (deploy-time admin from environment)", () => {
  it("creates the super admin when missing", async () => {
    const r = await ensureSuperAdmin("boss@test.local", "First-Strong-Pass-1!");
    expect(r).toBe("created");
    expect((await authenticate("boss@test.local", "First-Strong-Pass-1!", "x")).ok).toBe(true);
  });
  it("updates the password when the environment password changes, unlocks, and revokes sessions", async () => {
    const u = await makeUser("super_admin", "boss@test.local", "First-Strong-Pass-1!");
    const { token } = await createSession(u.id, {});
    await prisma.user.update({ where: { id: u.id }, data: { failedLoginCount: 3, lockedUntil: new Date(Date.now() + 600_000) } });
    expect(await ensureSuperAdmin("boss@test.local", "Second-Strong-Pass-2!")).toBe("password_updated");
    expect((await authenticate("boss@test.local", "First-Strong-Pass-1!", "x")).ok).toBe(false);
    expect((await authenticate("boss@test.local", "Second-Strong-Pass-2!", "x")).ok).toBe(true);
    expect(await validateSession(token)).toBeNull();
  });
  it("is a no-op when the password already matches", async () => {
    await makeUser("super_admin", "boss@test.local", "Same-Strong-Pass-3!");
    expect(await ensureSuperAdmin("boss@test.local", "Same-Strong-Pass-3!")).toBe("unchanged");
  });
  it("re-activates the account and restores the super admin role", async () => {
    const u = await makeUser("content_editor", "boss@test.local", "Same-Strong-Pass-3!");
    await prisma.user.update({ where: { id: u.id }, data: { isActive: false } });
    await ensureSuperAdmin("boss@test.local", "Same-Strong-Pass-3!");
    const after = await prisma.user.findUniqueOrThrow({ where: { id: u.id }, include: { role: true } });
    expect(after.isActive).toBe(true);
    expect(after.role.key).toBe("super_admin");
  });
  it("rejects weak passwords", async () => {
    await expect(ensureSuperAdmin("boss@test.local", "weak")).rejects.toThrow(/password/i);
  });
});
