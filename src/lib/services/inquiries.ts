import { prisma } from "@/lib/db";
import { inquirySchema, INQUIRY_STATUSES } from "@/lib/validation";
import { stripTags } from "@/lib/security/sanitize";
import { hashIp } from "@/lib/security/tokens";
import { RateLimiter, limiters } from "@/lib/security/rate-limit";
import { can, type RoleKey } from "@/lib/auth/rbac";
import { toCsv } from "@/lib/security/csv";
import { logActivity } from "./activity";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

export type Actor = { id: string; role: RoleKey | string };
type Result = { ok: true; id?: string } | { ok: false; status: number; error: string; fieldErrors?: Record<string, string[]> };

function forbid(actor: Actor, perm: Parameters<typeof can>[1]) {
  if (!can(actor.role, perm)) throw new Error("Forbidden");
}

export async function submitInquiry(raw: unknown, ctx: { ip: string; limiter?: RateLimiter }): Promise<Result> {
  const body = (raw ?? {}) as Record<string, unknown>;
  // Honeypot: real users never fill the hidden "website" field. Pretend success.
  if (typeof body.website === "string" && body.website.length > 0) return { ok: true };

  const rl = (ctx.limiter ?? limiters.forms).hit(`inq:${hashIp(ctx.ip)}`);
  if (!rl.allowed) return { ok: false, status: 429, error: "Too many requests. Please try again later." };

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, status: 422, error: "Please check the highlighted fields.", fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }
  const d = parsed.data;
  const clean = (s?: string) => (s ? stripTags(s) : undefined);

  let productId: string | undefined;
  let productName = clean(d.productName);
  if (d.productId) {
    const p = await prisma.product.findFirst({ where: { id: d.productId, isPublished: true }, select: { id: true, name: true } });
    if (p) { productId = p.id; productName = p.name; }
  }
  const message = clean(d.message) ?? "";
  if (message.length < 2) return { ok: false, status: 422, error: "Please enter a message.", fieldErrors: { message: ["Required"] } };

  const row = await prisma.inquiry.create({
    data: {
      type: d.type, name: clean(d.name)!, company: clean(d.company), email: d.email, phone: d.phone,
      productId, productName, quantity: d.quantity, subject: clean(d.subject), message,
      meta: d.meta ? (Object.fromEntries(Object.entries(d.meta).map(([k, v]) => [stripTags(k), stripTags(v)])) as Prisma.InputJsonValue) : undefined,
      ipHash: hashIp(ctx.ip),
    },
  });
  return { ok: true, id: row.id };
}

const updateSchema = z.object({ status: z.enum(INQUIRY_STATUSES).optional(), assigneeId: z.string().max(40).nullable().optional() });

export async function updateInquiry(actor: Actor, id: string, patch: z.input<typeof updateSchema>) {
  forbid(actor, "inquiries.manage");
  const data = updateSchema.parse(patch);
  if (data.assigneeId) {
    const exists = await prisma.user.findFirst({ where: { id: data.assigneeId, isActive: true } });
    if (!exists) throw new Error("Unknown assignee");
  }
  const inq = await prisma.inquiry.update({ where: { id }, data });
  await logActivity(actor.id, "update", "inquiry", id, `Status ${inq.status}${data.assigneeId ? ", assigned" : ""}`);
  return inq;
}

export async function addInquiryNote(actor: Actor, inquiryId: string, body: string) {
  forbid(actor, "inquiries.manage");
  const text = stripTags(z.string().min(1).max(4000).parse(body));
  return prisma.inquiryNote.create({ data: { inquiryId, authorId: actor.id, body: text } });
}

export type InquiryFilter = { status?: string; type?: string; q?: string };
export function inquiryWhere(f: InquiryFilter): Prisma.InquiryWhereInput {
  const where: Prisma.InquiryWhereInput = {};
  if (f.status && (INQUIRY_STATUSES as readonly string[]).includes(f.status)) where.status = f.status as never;
  if (f.type && ["GENERAL", "PRODUCT", "NETWORKING_PROJECT", "CORPORATE_QUOTE"].includes(f.type)) where.type = f.type as never;
  if (f.q) {
    const q = f.q.slice(0, 100);
    where.OR = [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } }, { productName: { contains: q, mode: "insensitive" } }];
  }
  return where;
}

export async function exportInquiriesCsv(actor: Actor, f: InquiryFilter) {
  forbid(actor, "inquiries.export");
  const rows = await prisma.inquiry.findMany({ where: inquiryWhere(f), orderBy: { createdAt: "desc" }, take: 10_000, include: { assignee: { select: { name: true } } } });
  await logActivity(actor.id, "export", "inquiry", undefined, `${rows.length} inquiries exported`);
  return toCsv([
    ["Date", "Type", "Status", "Name", "Company", "Email", "Phone", "Product", "Quantity", "Subject", "Message", "Assignee"],
    ...rows.map((r) => [r.createdAt, r.type, r.status, r.name, r.company, r.email, r.phone, r.productName, r.quantity, r.subject, r.message, r.assignee?.name]),
  ]);
}
