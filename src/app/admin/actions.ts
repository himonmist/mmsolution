"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticate, createSession, destroySession, requestPasswordReset, resetPassword } from "@/lib/services/auth";
import { saveProduct, deleteProduct, saveEntity, deleteEntity, ENTITIES, type EntityName } from "@/lib/services/content";
import { updateInquiry, addInquiryNote } from "@/lib/services/inquiries";
import { processImageUpload } from "@/lib/services/media";
import { logActivity } from "@/lib/services/activity";
import { setSessionCookie, clearSessionCookie, getSessionToken, requireActor, clientIp } from "@/lib/auth/session";
import { loginSchema, resetSchema, resetRequestSchema } from "@/lib/validation";
import { limiters } from "@/lib/security/rate-limit";
import { hashIp } from "@/lib/security/tokens";
import { hashPassword, checkPasswordPolicy } from "@/lib/security/password";
import { SETTINGS_SCHEMAS, type SettingsKey } from "@/lib/settings";
import { ROLES } from "@/lib/auth/rbac";
import { sendMail } from "@/lib/mailer";
import { siteUrl } from "@/lib/seo";
import { RESOURCES } from "@/lib/admin/fields";
import type { Prisma } from "@prisma/client";

export type ActionResult = { ok: boolean; error?: string; id?: string; message?: string };
const fail = (e: unknown): ActionResult => {
  if (e instanceof z.ZodError) return { ok: false, error: e.issues.map((i) => `${i.path.join(".") || "field"}: ${i.message}`).slice(0, 4).join(" · ") };
  const msg = (e as Error)?.message ?? "";
  if (/Forbidden|Unauthenticated/.test(msg)) return { ok: false, error: "You do not have permission for this action." };
  if (/Unique constraint/.test(msg)) return { ok: false, error: "That value is already in use (e.g. slug or email)." };
  if (/Foreign key|Restrict/.test(msg)) return { ok: false, error: "This item is in use by other records and cannot be removed." };
  if (/Unknown|cannot be its own parent|Invalid/.test(msg)) return { ok: false, error: msg };
  console.error("[admin action]", e);
  return { ok: false, error: "Something went wrong. Please try again." };
};
const revalidateSite = () => revalidatePath("/", "layout");

// ───────────── Auth ─────────────
export async function loginAction(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const ip = await clientIp();
  const parsed = loginSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) return { ok: false, error: "Invalid email or password." };
  const rl = limiters.login.hit(`login:${hashIp(ip)}`);
  const rlAcct = limiters.login.hit(`login-acct:${parsed.data.email}`);
  if (!rl.allowed || !rlAcct.allowed) return { ok: false, error: "Too many attempts. Please wait 15 minutes and try again." };
  const r = await authenticate(parsed.data.email, parsed.data.password, ip);
  if (!r.ok) return { ok: false, error: r.error };
  const { token } = await createSession(r.user.id, { ip: hashIp(ip), userAgent: "" });
  await setSessionCookie(token);
  redirect("/admin");
}

export async function logoutAction() {
  const t = await getSessionToken();
  if (t) await destroySession(t);
  await clearSessionCookie();
  redirect("/admin/login");
}

export async function forgotAction(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const generic = { ok: true, message: "If that email belongs to an active account, a reset link has been sent." };
  const parsed = resetRequestSchema.safeParse({ email: fd.get("email") });
  if (!parsed.success) return generic;
  if (!limiters.reset.hit(`reset:${hashIp(await clientIp())}`).allowed) return generic;
  const { token } = await requestPasswordReset(parsed.data.email);
  if (token) await sendMail(parsed.data.email, "Reset your MM Business Solution admin password",
    `A password reset was requested for your account.\n\nReset link (valid 30 minutes):\n${siteUrl()}/admin/reset-password?token=${token}\n\nIf you didn't request this, ignore this email.`);
  return generic;
}

export async function resetAction(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const parsed = resetSchema.safeParse({ token: fd.get("token"), password: fd.get("password") });
  if (!parsed.success) return { ok: false, error: "Invalid request." };
  if (fd.get("password") !== fd.get("confirm")) return { ok: false, error: "Passwords do not match." };
  const r = await resetPassword(parsed.data.token, parsed.data.password);
  return r.ok ? { ok: true, message: "Password updated. You can now sign in." } : { ok: false, error: r.error };
}

// ───────────── Content ─────────────
function normalise(data: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === "" && ["price", "completedAt"].includes(k)) continue;
    out[k] = v;
  }
  return out;
}

export async function saveResourceAction(resource: string, id: string | null, data: Record<string, unknown>): Promise<ActionResult> {
  try {
    const cfg = RESOURCES[resource];
    if (!cfg) throw new Error("Unknown resource");
    const user = await requireActor(cfg.perm);
    const d = normalise(data);
    const row = resource === "products"
      ? await saveProduct(user, id, d as never)
      : await saveEntity(user, resource as EntityName, id, d);
    revalidateSite();
    return { ok: true, id: row.id, message: "Saved." };
  } catch (e) { return fail(e); }
}

export async function deleteResourceAction(resource: string, id: string): Promise<ActionResult> {
  try {
    const cfg = RESOURCES[resource];
    if (!cfg) throw new Error("Unknown resource");
    const user = await requireActor(cfg.perm);
    if (resource === "products") await deleteProduct(user, id); else await deleteEntity(user, resource as EntityName, id);
    revalidateSite();
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function moveResourceAction(resource: string, id: string, dir: "up" | "down"): Promise<ActionResult> {
  try {
    const cfg = RESOURCES[resource];
    if (!cfg || resource === "posts" || resource === "pages") throw new Error("Unknown resource");
    const user = await requireActor(cfg.perm);
    const delegate = (resource === "products" ? prisma.product : (ENTITIES as Record<string, { delegate: () => unknown }>)[resource].delegate()) as {
      findMany: (a: object) => Promise<{ id: string; sortOrder: number }[]>; update: (a: object) => Promise<unknown>;
    };
    const rows = await delegate.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true, sortOrder: true } });
    const i = rows.findIndex((r) => r.id === id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= rows.length) return { ok: true };
    [rows[i], rows[j]] = [rows[j], rows[i]];
    await prisma.$transaction(rows.map((r, k) => delegate.update({ where: { id: r.id }, data: { sortOrder: k } }) as Prisma.PrismaPromise<unknown>));
    await logActivity(user.id, "reorder", resource, id);
    revalidateSite();
    return { ok: true };
  } catch (e) { return fail(e); }
}

// ───────────── Inquiries ─────────────
export async function updateInquiryAction(id: string, patch: { status?: string; assigneeId?: string | null }): Promise<ActionResult> {
  try {
    const user = await requireActor("inquiries.manage");
    await updateInquiry(user, id, patch as never);
    revalidatePath(`/admin/inquiries/${id}`);
    return { ok: true, message: "Updated." };
  } catch (e) { return fail(e); }
}

export async function addNoteAction(id: string, body: string): Promise<ActionResult> {
  try {
    const user = await requireActor("inquiries.manage");
    await addInquiryNote(user, id, body);
    revalidatePath(`/admin/inquiries/${id}`);
    return { ok: true };
  } catch (e) { return fail(e); }
}

// ───────────── Settings ─────────────
export async function saveSettingsAction(key: string, value: unknown): Promise<ActionResult> {
  try {
    const user = await requireActor(key === "hero" || key === "intro" || key === "stats" ? "homepage.write" : "settings.manage");
    const schema = (SETTINGS_SCHEMAS as Record<string, z.ZodTypeAny>)[key];
    if (!schema || !Object.hasOwn(SETTINGS_SCHEMAS, key)) throw new Error("Unknown setting");
    const data = schema.parse(value) as Prisma.InputJsonValue;
    await prisma.siteSetting.upsert({ where: { key }, update: { value: data }, create: { key: key as SettingsKey, value: data } });
    await logActivity(user.id, "update", "settings", key);
    revalidateSite();
    return { ok: true, message: "Settings saved." };
  } catch (e) { return fail(e); }
}

// ───────────── Media ─────────────
export async function uploadMediaAction(fd: FormData): Promise<ActionResult & { url?: string }> {
  try {
    const user = await requireActor("media.write");
    const file = fd.get("file");
    if (!(file instanceof File)) return { ok: false, error: "No file received." };
    const r = await processImageUpload(Buffer.from(await file.arrayBuffer()), file.name);
    if (!r.ok) return { ok: false, error: r.error };
    const m = await prisma.media.create({ data: { url: r.url, filename: r.filename, mimeType: r.mimeType, sizeBytes: r.sizeBytes, width: r.width, height: r.height, uploadedBy: user.id, alt: String(fd.get("alt") ?? "").slice(0, 200) || null } });
    await logActivity(user.id, "upload", "media", m.id, r.filename);
    revalidatePath("/admin/media");
    return { ok: true, url: r.url, id: m.id };
  } catch (e) { return fail(e); }
}

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  try {
    const user = await requireActor("media.write");
    await prisma.media.delete({ where: { id } });
    await logActivity(user.id, "delete", "media", id);
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (e) { return fail(e); }
}

// ───────────── Users ─────────────
const userSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().toLowerCase().email().max(160), role: z.enum(ROLES), password: z.string().max(128).optional() });

export async function saveUserAction(id: string | null, data: unknown): Promise<ActionResult> {
  try {
    const actor = await requireActor("users.manage");
    const d = userSchema.parse(data);
    const role = await prisma.role.findUniqueOrThrow({ where: { key: d.role } });
    if (d.password) { const p = checkPasswordPolicy(d.password); if (!p.ok) return { ok: false, error: p.reason }; }
    if (id === actor.id && d.role !== "super_admin") return { ok: false, error: "You cannot remove your own super administrator role." };
    const row = id
      ? await prisma.user.update({ where: { id }, data: { name: d.name, email: d.email, roleId: role.id, ...(d.password ? { passwordHash: await hashPassword(d.password), passwordChangedAt: new Date() } : {}) } })
      : await prisma.user.create({ data: { name: d.name, email: d.email, roleId: role.id, passwordHash: await hashPassword(d.password || crypto.randomUUID() + "Aa1!") } });
    if (id && d.password) await prisma.session.deleteMany({ where: { userId: id } });
    await logActivity(actor.id, id ? "update" : "create", "user", row.id, d.email);
    revalidatePath("/admin/users");
    return { ok: true, id: row.id, message: "User saved." };
  } catch (e) { return fail(e); }
}

export async function toggleUserAction(id: string): Promise<ActionResult> {
  try {
    const actor = await requireActor("users.manage");
    if (id === actor.id) return { ok: false, error: "You cannot deactivate yourself." };
    const u = await prisma.user.findUniqueOrThrow({ where: { id } });
    await prisma.user.update({ where: { id }, data: { isActive: !u.isActive } });
    if (u.isActive) await prisma.session.deleteMany({ where: { userId: id } });
    await logActivity(actor.id, u.isActive ? "deactivate" : "activate", "user", id, u.email);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) { return fail(e); }
}
