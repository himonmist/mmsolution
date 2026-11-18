import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { submitInquiry, updateInquiry, addInquiryNote, exportInquiriesCsv } from "@/lib/services/inquiries";
import { RateLimiter } from "@/lib/security/rate-limit";
import { resetDb, makeUser } from "./helpers";

beforeEach(resetDb);
const valid = { type: "PRODUCT", name: "Rahim Uddin", email: "rahim@example.com", message: "Need 20 units for our office.", quantity: 20 };

describe("public inquiry submission", () => {
  it("stores a valid inquiry with status NEW and a hashed IP", async () => {
    const r = await submitInquiry({ ...valid, status: "COMPLETED" }, { ip: "9.9.9.9" });
    expect(r.ok).toBe(true);
    const row = await prisma.inquiry.findFirst();
    expect(row!.status).toBe("NEW");
    expect(row!.ipHash).not.toContain("9.9.9.9");
  });
  it("silently drops honeypot submissions (bots)", async () => {
    const r = await submitInquiry({ ...valid, website: "http://spam" }, { ip: "1.1.1.1" });
    expect(r.ok).toBe(true);
    expect(await prisma.inquiry.count()).toBe(0);
  });
  it("rejects invalid payloads with field errors", async () => {
    const r = await submitInquiry({ ...valid, email: "bad" }, { ip: "1.1.1.1" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors?.email).toBeDefined();
  });
  it("rate limits per client", async () => {
    const limiter = new RateLimiter({ limit: 2, windowMs: 60_000 });
    await submitInquiry(valid, { ip: "2.2.2.2", limiter });
    await submitInquiry(valid, { ip: "2.2.2.2", limiter });
    const r = await submitInquiry(valid, { ip: "2.2.2.2", limiter });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(429);
  });
  it("stores user text verbatim-but-inert (escaping happens at render), and strips tags", async () => {
    await submitInquiry({ ...valid, message: "<script>alert(1)</script>Hello there" }, { ip: "3.3.3.3" });
    const row = await prisma.inquiry.findFirst();
    expect(row!.message).toBe("Hello there");
  });
  it("links the product server-side and uses the canonical product name", async () => {
    const c = await prisma.category.create({ data: { name: "Laptops", slug: "laptops" } });
    const p = await prisma.product.create({ data: { name: "HP ProBook", slug: "hp-probook", categoryId: c.id, isPublished: true } });
    await submitInquiry({ ...valid, productId: p.id, productName: "Spoofed" }, { ip: "4.4.4.4" });
    const row = await prisma.inquiry.findFirst();
    expect(row!.productId).toBe(p.id);
    expect(row!.productName).toBe("HP ProBook");
  });
});

describe("inquiry management", () => {
  it("enforces permissions on updates", async () => {
    await submitInquiry(valid, { ip: "5.5.5.5" });
    const inq = await prisma.inquiry.findFirstOrThrow();
    const editor = await makeUser("content_editor");
    const mgr = await makeUser("inquiry_manager");
    await expect(updateInquiry({ id: editor.id, role: "content_editor" }, inq.id, { status: "IN_REVIEW" })).rejects.toThrow(/forbidden/i);
    await updateInquiry({ id: mgr.id, role: "inquiry_manager" }, inq.id, { status: "QUOTATION_SENT", assigneeId: mgr.id });
    const after = await prisma.inquiry.findUniqueOrThrow({ where: { id: inq.id } });
    expect(after.status).toBe("QUOTATION_SENT");
    expect(after.assigneeId).toBe(mgr.id);
    expect(await prisma.activityLog.count({ where: { entityId: inq.id } })).toBe(1);
  });
  it("rejects invalid statuses", async () => {
    await submitInquiry(valid, { ip: "5.5.5.5" });
    const inq = await prisma.inquiry.findFirstOrThrow();
    const mgr = await makeUser("inquiry_manager");
    await expect(updateInquiry({ id: mgr.id, role: "inquiry_manager" }, inq.id, { status: "HACKED" as never })).rejects.toThrow();
  });
  it("adds internal notes", async () => {
    await submitInquiry(valid, { ip: "5.5.5.5" });
    const inq = await prisma.inquiry.findFirstOrThrow();
    const mgr = await makeUser("inquiry_manager");
    await addInquiryNote({ id: mgr.id, role: "inquiry_manager" }, inq.id, "Called client, sending quote.");
    expect(await prisma.inquiryNote.count()).toBe(1);
  });
  it("exports CSV safely and only for permitted roles", async () => {
    await submitInquiry({ ...valid, name: "=cmd|' /C calc'!A0" }, { ip: "6.6.6.6" });
    const mgr = await makeUser("inquiry_manager");
    const csv = await exportInquiriesCsv({ id: mgr.id, role: "inquiry_manager" }, {});
    expect(csv.split("\r\n")[0]).toContain("Name");
    expect(csv).toContain(`"'=cmd`);
    const pm = await makeUser("product_manager");
    await expect(exportInquiriesCsv({ id: pm.id, role: "product_manager" }, {})).rejects.toThrow(/forbidden/i);
  });
});
