import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { authenticate, createSession, validateSession, destroySession, requestPasswordReset, resetPassword, MAX_FAILED } from "@/lib/services/auth";
import { resetDb, makeUser } from "./helpers";

beforeEach(resetDb);

describe("authentication", () => {
  it("logs in with correct credentials and records activity", async () => {
    await makeUser();
    const r = await authenticate("super_admin@test.local", "Blue-Rack-Switch-42", "1.1.1.1");
    expect(r.ok).toBe(true);
    expect(await prisma.activityLog.count({ where: { action: "login" } })).toBe(1);
  });
  it("returns the same generic error for unknown user and bad password (no enumeration)", async () => {
    await makeUser();
    const a = await authenticate("nobody@test.local", "whatever-pass", "1.1.1.1");
    const b = await authenticate("super_admin@test.local", "wrong-password", "1.1.1.1");
    expect(a).toEqual({ ok: false, error: "Invalid email or password." });
    expect(b).toEqual({ ok: false, error: "Invalid email or password." });
  });
  it("locks the account after repeated failures, even with the right password", async () => {
    await makeUser();
    for (let i = 0; i < MAX_FAILED; i++) await authenticate("super_admin@test.local", "nope-nope-nope", "1.1.1.1");
    const r = await authenticate("super_admin@test.local", "Blue-Rack-Switch-42", "1.1.1.1");
    expect(r.ok).toBe(false);
    const u = await prisma.user.findUnique({ where: { email: "super_admin@test.local" } });
    expect(u!.lockedUntil!.getTime()).toBeGreaterThan(Date.now());
  });
  it("refuses deactivated users", async () => {
    const u = await makeUser();
    await prisma.user.update({ where: { id: u.id }, data: { isActive: false } });
    expect((await authenticate(u.email, "Blue-Rack-Switch-42", "x")).ok).toBe(false);
  });
});

describe("sessions", () => {
  it("stores only a hash of the token and validates it", async () => {
    const u = await makeUser();
    const { token } = await createSession(u.id, { ip: "1.1.1.1", userAgent: "vitest" });
    const row = await prisma.session.findFirst();
    expect(row!.tokenHash).not.toContain(token);
    const s = await validateSession(token);
    expect(s?.user.id).toBe(u.id);
    expect(s?.user.role).toBe("super_admin");
  });
  it("rejects garbage, expired and destroyed sessions", async () => {
    const u = await makeUser();
    expect(await validateSession("garbage")).toBeNull();
    const { token } = await createSession(u.id, {});
    await prisma.session.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } });
    expect(await validateSession(token)).toBeNull();
    const t2 = (await createSession(u.id, {})).token;
    await destroySession(t2);
    expect(await validateSession(t2)).toBeNull();
  });
  it("invalidates sessions of deactivated users", async () => {
    const u = await makeUser();
    const { token } = await createSession(u.id, {});
    await prisma.user.update({ where: { id: u.id }, data: { isActive: false } });
    expect(await validateSession(token)).toBeNull();
  });
});

describe("password reset", () => {
  it("issues a single-use, expiring token and revokes existing sessions", async () => {
    const u = await makeUser();
    const { token: sess } = await createSession(u.id, {});
    const issued = await requestPasswordReset(u.email);
    expect(issued.token).toBeTruthy();
    const stored = await prisma.passwordResetToken.findFirst();
    expect(stored!.tokenHash).not.toBe(issued.token);

    expect((await resetPassword(issued.token!, "weak")).ok).toBe(false);
    expect((await resetPassword(issued.token!, "New-Strong-Pass-77")).ok).toBe(true);
    expect((await resetPassword(issued.token!, "Another-Strong-88")).ok).toBe(false); // single use
    expect(await validateSession(sess)).toBeNull();
  });
  it("does not reveal whether an email exists", async () => {
    const r = await requestPasswordReset("ghost@test.local");
    expect(r.token).toBeUndefined();
  });
  it("rejects expired tokens", async () => {
    const u = await makeUser();
    const issued = await requestPasswordReset(u.email);
    await prisma.passwordResetToken.updateMany({ data: { expiresAt: new Date(Date.now() - 1) } });
    expect((await resetPassword(issued.token!, "New-Strong-Pass-77")).ok).toBe(false);
  });
});
