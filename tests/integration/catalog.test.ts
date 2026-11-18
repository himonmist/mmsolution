import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { saveProduct, deleteProduct, saveEntity, deleteEntity } from "@/lib/services/content";
import { resetDb, makeUser } from "./helpers";

beforeEach(resetDb);

async function setup() {
  const pm = await makeUser("product_manager");
  const cat = await prisma.category.create({ data: { name: "Laptops", slug: "laptops" } });
  return { actor: { id: pm.id, role: "product_manager" as const }, cat };
}

describe("product management", () => {
  it("creates a product with specs and images, sanitising rich text and generating a slug", async () => {
    const { actor, cat } = await setup();
    const p = await saveProduct(actor, null, {
      name: "HP ProBook 450", categoryId: cat.id, description: `<p>Fast</p><script>alert(1)</script>`,
      specifications: [{ label: "CPU", value: "Configurable" }], images: [{ url: "/media/laptop.webp" }], isPublished: true,
    });
    expect(p.slug).toBe("hp-probook-450");
    const full = await prisma.product.findUniqueOrThrow({ where: { id: p.id }, include: { specifications: true, images: true } });
    expect(full.description).toBe("<p>Fast</p>");
    expect(full.specifications).toHaveLength(1);
    expect(full.images).toHaveLength(1);
  });
  it("makes slugs unique", async () => {
    const { actor, cat } = await setup();
    await saveProduct(actor, null, { name: "Router", categoryId: cat.id });
    const b = await saveProduct(actor, null, { name: "Router", categoryId: cat.id });
    expect(b.slug).toBe("router-2");
  });
  it("replaces specifications on update", async () => {
    const { actor, cat } = await setup();
    const p = await saveProduct(actor, null, { name: "X", categoryId: cat.id, specifications: [{ label: "A", value: "1" }, { label: "B", value: "2" }] });
    await saveProduct(actor, p.id, { name: "X", categoryId: cat.id, specifications: [{ label: "C", value: "3" }] });
    expect(await prisma.productSpecification.count()).toBe(1);
  });
  it("rejects image urls that are not local or https", async () => {
    const { actor, cat } = await setup();
    await expect(saveProduct(actor, null, { name: "X", categoryId: cat.id, images: [{ url: "javascript:alert(1)" }] })).rejects.toThrow();
  });
  it("forbids roles without products.write", async () => {
    const { cat } = await setup();
    const ed = await makeUser("content_editor");
    await expect(saveProduct({ id: ed.id, role: "content_editor" }, null, { name: "X", categoryId: cat.id })).rejects.toThrow(/forbidden/i);
  });
  it("deletes and logs", async () => {
    const { actor, cat } = await setup();
    const p = await saveProduct(actor, null, { name: "X", categoryId: cat.id });
    await deleteProduct(actor, p.id);
    expect(await prisma.product.count()).toBe(0);
    expect(await prisma.activityLog.count({ where: { action: "delete" } })).toBe(1);
  });
});

describe("empty optional relations from forms", () => {
  it("stores no brand / no parent instead of an invalid foreign key", async () => {
    const { actor, cat } = await setup();
    const p = await saveProduct(actor, null, { name: "No Brand", categoryId: cat.id, brandId: "" });
    expect(p.brandId).toBeNull();
    const c = await saveEntity({ ...actor, role: "admin" }, "categories", null, { name: "Top", parentId: "" });
    expect(c.parentId).toBeNull();
  });
});

describe("generic entities", () => {
  it("creates a brand with a validated website url", async () => {
    const { actor } = await setup();
    const b = await saveEntity(actor, "brands", null, { name: "Cisco", websiteUrl: "https://cisco.com", isActive: true });
    expect(b.slug).toBe("cisco");
    await expect(saveEntity(actor, "brands", null, { name: "Bad", websiteUrl: "javascript:alert(1)" })).rejects.toThrow();
  });
  it("content editor can manage posts but not brands", async () => {
    const ed = await makeUser("content_editor");
    const a = { id: ed.id, role: "content_editor" as const };
    const post = await saveEntity(a, "posts", null, { title: "Choosing a laptop", body: "<p>Hi</p><img src=x onerror=1>", status: "PUBLISHED" });
    expect(post.body).toBe('<p>Hi</p><img src="x" />');
    await expect(saveEntity(a, "brands", null, { name: "HP" })).rejects.toThrow(/forbidden/i);
    await deleteEntity(a, "posts", post.id);
    expect(await prisma.blogPost.count()).toBe(0);
  });
  it("rejects unknown resource names", async () => {
    const { actor } = await setup();
    await expect(saveEntity(actor, "users" as never, null, {})).rejects.toThrow();
  });
});
