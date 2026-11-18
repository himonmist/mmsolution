import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { validateSession, SESSION_TTL_MS } from "@/lib/services/auth";
import { can, type Permission } from "./rbac";

export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-mm_session" : "mm_session";

export async function setSessionCookie(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

export const getSessionToken = async () => (await cookies()).get(SESSION_COOKIE)?.value;

export const getCurrentUser = cache(async () => {
  const s = await validateSession(await getSessionToken());
  return s?.user ?? null;
});

/** Use at the top of every admin page and server action. */
export async function requireUser(perm?: Permission) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (perm && !can(user.role, perm)) redirect("/admin?denied=1");
  return user;
}

/** For server actions: throws instead of redirecting on missing permission. */
export async function requireActor(perm: Permission) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  if (!can(user.role, perm)) throw new Error("Forbidden");
  return user;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  // Trust only the first hop set by our own reverse proxy (Nginx/Cloudflare).
  return h.get("cf-connecting-ip") ?? h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
