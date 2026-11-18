import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const u = siteUrl();
  const [products, services, projects, posts, pages, cats] = await Promise.all([
    prisma.product.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    prisma.service.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    prisma.project.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    prisma.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.page.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
  ]);
  const fixed = ["", "/about", "/products", "/solutions", "/brands", "/projects", "/news", "/contact", "/quote"].map((p) => ({ url: `${u}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 }));
  return [
    ...fixed,
    ...cats.map((c) => ({ url: `${u}/products?category=${c.slug}`, lastModified: c.updatedAt, priority: 0.7 })),
    ...products.map((p) => ({ url: `${u}/products/${p.slug}`, lastModified: p.updatedAt, priority: 0.7 })),
    ...services.map((s) => ({ url: `${u}/solutions/${s.slug}`, lastModified: s.updatedAt, priority: 0.7 })),
    ...projects.map((p) => ({ url: `${u}/projects/${p.slug}`, lastModified: p.updatedAt, priority: 0.5 })),
    ...posts.map((p) => ({ url: `${u}/news/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ...pages.map((p) => ({ url: ["privacy-policy", "terms"].includes(p.slug) ? `${u}/${p.slug}` : `${u}/p/${p.slug}`, lastModified: p.updatedAt, priority: 0.3 })),
  ];
}
