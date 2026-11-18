import { z } from "zod";
import { prisma } from "@/lib/db";
import { productSchema } from "@/lib/validation";
import { sanitizeRichText, stripTags } from "@/lib/security/sanitize";
import { slugify, SLUG_RE } from "@/lib/slug";
import { can, type Permission } from "@/lib/auth/rbac";
import { logActivity } from "./activity";
import type { Actor } from "./inquiries";

function forbid(actor: Actor, perm: Permission) {
  if (!can(actor.role, perm)) throw new Error("Forbidden");
}

/** Local upload/media path or http(s) URL. Blocks javascript:, data:, protocol-relative etc. */
export const assetUrl = z
  .string()
  .trim()
  .max(500)
  .refine((u) => /^\/(uploads|media|brand)\/[\w\-./]+$/.test(u) && !u.includes("..") || /^https:\/\/[^\s"'<>]+$/.test(u), "Invalid image URL");
const blank = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);
const optAsset = z.preprocess(blank, assetUrl.optional());
const optStr = (max: number) => z.preprocess(blank, z.string().trim().max(max).optional());
const httpUrl = z.string().trim().max(300).regex(/^https?:\/\/[^\s"'<>]+$/, "Must be an http(s) URL");
const optSlug = z.preprocess(blank, z.string().trim().max(96).regex(SLUG_RE).optional());
const bool = z.boolean().default(false);
const order = z.coerce.number().int().min(-100000).max(100000).default(0);
const stringList = (n: number, max = 200) => z.array(z.string().trim().min(1).max(max)).max(n).default([]);

async function uniqueSlug(model: { findFirst: (a: { where: { slug: string; NOT?: { id: string } } }) => Promise<unknown> }, base: string, id: string | null) {
  const root = base || "item";
  let candidate = root;
  for (let i = 2; i < 500; i++) {
    const clash = await model.findFirst({ where: { slug: candidate, ...(id ? { NOT: { id } } : {}) } });
    if (!clash) return candidate;
    candidate = `${root}-${i}`;
  }
  throw new Error("Could not allocate slug");
}

// ───────────── Products ─────────────

export async function saveProduct(actor: Actor, id: string | null, input: z.input<typeof productSchema>) {
  forbid(actor, "products.write");
  const d = productSchema.parse(input);
  d.images.forEach((im) => assetUrl.parse(im.url));
  const slug = await uniqueSlug(prisma.product as never, d.slug ?? slugify(d.name), id);
  const data = {
    name: stripTags(d.name), slug, modelNumber: d.modelNumber, shortDescription: d.shortDescription && stripTags(d.shortDescription),
    description: d.description ? sanitizeRichText(d.description) : null, categoryId: d.categoryId, brandId: d.brandId ?? null,
    availability: d.availability, priceMode: d.priceMode, price: d.price ?? null, features: d.features.map(stripTags),
    isFeatured: d.isFeatured, isNewArrival: d.isNewArrival, isPublished: d.isPublished, sortOrder: d.sortOrder,
    seoTitle: d.seoTitle, seoDescription: d.seoDescription,
  };
  const specs = d.specifications.map((s, i) => ({ label: stripTags(s.label), value: stripTags(s.value), group: s.group, sortOrder: i }));
  const images = d.images.map((im, i) => ({ url: im.url, alt: im.alt, sortOrder: i }));

  const product = await prisma.$transaction(async (tx) => {
    if (id) {
      await tx.productSpecification.deleteMany({ where: { productId: id } });
      await tx.productImage.deleteMany({ where: { productId: id } });
      return tx.product.update({ where: { id }, data: { ...data, specifications: { create: specs }, images: { create: images } } });
    }
    return tx.product.create({ data: { ...data, specifications: { create: specs }, images: { create: images } } });
  });
  await logActivity(actor.id, id ? "update" : "create", "product", product.id, product.name);
  return product;
}

export async function deleteProduct(actor: Actor, id: string) {
  forbid(actor, "products.write");
  const p = await prisma.product.delete({ where: { id } });
  await logActivity(actor.id, "delete", "product", id, p.name);
}

// ───────────── Generic entities ─────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (args: any) => Promise<any>;
type EntityDef = {
  perm: Permission;
  label: string;
  delegate: () => { create: AnyFn; update: AnyFn; delete: AnyFn; findFirst: AnyFn };
  schema: z.ZodObject<z.ZodRawShape>;
  slugFrom?: string;
  rich?: string[];
  plain?: string[];
};

export const ENTITIES = {
  categories: {
    perm: "categories.write", label: "Category", delegate: () => prisma.category, slugFrom: "name", plain: ["name", "description"],
    schema: z.object({ name: z.string().trim().min(1).max(120), slug: optSlug, description: optStr(500), image: optAsset, icon: optStr(40),
      parentId: optStr(40).transform((v) => v ?? null), sortOrder: order, isPublished: z.boolean().default(true) }),
  },
  brands: {
    perm: "brands.write", label: "Brand", delegate: () => prisma.brand, slugFrom: "name", plain: ["name", "description"],
    schema: z.object({ name: z.string().trim().min(1).max(80), slug: optSlug, logo: optAsset, description: optStr(500),
      websiteUrl: z.preprocess(blank, httpUrl.optional()), isActive: z.boolean().default(true), sortOrder: order }),
  },
  services: {
    perm: "services.write", label: "Service", delegate: () => prisma.service, slugFrom: "title", rich: ["description"], plain: ["title", "summary"],
    schema: z.object({ title: z.string().trim().min(1).max(120), slug: optSlug, summary: optStr(400), description: optStr(50000), icon: optStr(40),
      image: optAsset, features: stringList(30), isPublished: z.boolean().default(true), sortOrder: order, seoTitle: optStr(70), seoDescription: optStr(170) }),
  },
  projects: {
    perm: "projects.write", label: "Project", delegate: () => prisma.project, slugFrom: "title", rich: ["description", "implementationDetails"], plain: ["title", "summary", "clientName", "category"],
    schema: z.object({ title: z.string().trim().min(1).max(160), slug: optSlug, clientName: optStr(160), category: z.string().trim().min(1).max(80),
      summary: optStr(500), description: optStr(50000), implementationDetails: optStr(50000), technologies: stringList(30, 80),
      completedAt: z.union([z.coerce.date(), z.literal("").transform(() => null)]).optional().nullable(), coverImage: optAsset, isPublished: bool, sortOrder: order }),
  },
  testimonials: {
    perm: "testimonials.write", label: "Testimonial", delegate: () => prisma.testimonial, plain: ["clientName", "designation", "organization", "quote"],
    schema: z.object({ clientName: z.string().trim().min(1).max(120), designation: optStr(120), organization: optStr(160), quote: z.string().trim().min(1).max(1500),
      image: optAsset, isPublished: bool, sortOrder: order }),
  },
  posts: {
    perm: "posts.write", label: "Article", delegate: () => prisma.blogPost, slugFrom: "title", rich: ["body"], plain: ["title", "excerpt", "category"],
    schema: z.object({ title: z.string().trim().min(1).max(200), slug: optSlug, excerpt: optStr(500), body: optStr(100000), coverImage: optAsset,
      category: z.string().trim().max(60).default("Insights"), status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
      seoTitle: optStr(70), seoDescription: optStr(170) }),
  },
  pages: {
    perm: "pages.write", label: "Page", delegate: () => prisma.page, slugFrom: "title", rich: ["body"], plain: ["title"],
    schema: z.object({ title: z.string().trim().min(1).max(200), slug: optSlug, body: optStr(200000), status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
      seoTitle: optStr(70), seoDescription: optStr(170) }),
  },
  banners: {
    perm: "banners.write", label: "Banner", delegate: () => prisma.banner, plain: ["title", "subtitle", "ctaLabel"],
    schema: z.object({ placement: z.enum(["home_top", "products_top", "solutions_top"]), title: z.string().trim().min(1).max(160), subtitle: optStr(300),
      image: optAsset, ctaLabel: optStr(40), ctaHref: optStr(300).refine((v) => !v || /^(\/[^\s/\\][^\s]*|\/|https:\/\/[^\s"'<>]+)$/.test(v), "Invalid link"),
      isActive: z.boolean().default(true), sortOrder: order }),
  },
} satisfies Record<string, EntityDef>;

export type EntityName = keyof typeof ENTITIES;

export async function saveEntity(actor: Actor, name: EntityName, id: string | null, input: Record<string, unknown>) {
  const def = (ENTITIES as Record<string, EntityDef>)[name];
  if (!def || !Object.hasOwn(ENTITIES, name)) throw new Error("Unknown resource");
  forbid(actor, def.perm);
  const data = def.schema.parse(input) as Record<string, unknown>;
  for (const f of def.rich ?? []) if (typeof data[f] === "string") data[f] = sanitizeRichText(data[f] as string);
  for (const f of def.plain ?? []) if (typeof data[f] === "string") data[f] = stripTags(data[f] as string);
  if (def.slugFrom) data.slug = await uniqueSlug(def.delegate() as never, (data.slug as string) ?? slugify(String(data[def.slugFrom])), id);
  if (name === "posts" && data.status === "PUBLISHED") {
    const existing = id ? await prisma.blogPost.findUnique({ where: { id }, select: { publishedAt: true } }) : null;
    data.publishedAt = existing?.publishedAt ?? new Date();
  }
  if (name === "categories" && id && data.parentId === id) throw new Error("A category cannot be its own parent");
  const d = def.delegate();
  const row = id ? await d.update({ where: { id }, data }) : await d.create({ data });
  await logActivity(actor.id, id ? "update" : "create", name, row.id, String(data.name ?? data.title ?? data.clientName ?? ""));
  return row;
}

export async function deleteEntity(actor: Actor, name: EntityName, id: string) {
  const def = (ENTITIES as Record<string, EntityDef>)[name];
  if (!def || !Object.hasOwn(ENTITIES, name)) throw new Error("Unknown resource");
  forbid(actor, def.perm);
  await def.delegate().delete({ where: { id } });
  await logActivity(actor.id, "delete", name, id);
}
