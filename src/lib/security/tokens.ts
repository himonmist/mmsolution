import { randomBytes, createHash, timingSafeEqual } from "node:crypto";

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a), bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Salted, non-reversible client fingerprint for abuse tracking (never store raw IPs). */
export function hashIp(ip: string): string {
  return sha256(`${process.env.IP_HASH_SALT ?? "mm-ip-salt"}:${ip}`).slice(0, 32);
}
