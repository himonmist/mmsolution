import bcrypt from "bcryptjs";

const COST = 12;
const COMMON = new Set([
  "password123!", "password1234", "qwerty123456", "admin@123456", "welcome12345",
  "letmein12345", "iloveyou1234", "bangladesh123", "123456789abc", "p@ssw0rd1234",
]);

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!hash || plain.length > 128) return false;
  return bcrypt.compare(plain, hash);
}

/** A dummy hash used to equalise timing when a user does not exist. */
export const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEeO5tH9/6vKcK6nU1nK1u0T6w2o2lV9b1S";

export function checkPasswordPolicy(pw: string): { ok: boolean; reason?: string } {
  if (pw.length < 12) return { ok: false, reason: "Use at least 12 characters." };
  if (Buffer.byteLength(pw, "utf8") > 72) return { ok: false, reason: "Use at most 72 bytes." };
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  if (classes < 3) return { ok: false, reason: "Mix upper/lower case, numbers and symbols." };
  if (COMMON.has(pw.toLowerCase())) return { ok: false, reason: "This password is too common." };
  return { ok: true };
}
