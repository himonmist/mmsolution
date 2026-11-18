import { cache } from "react";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export const productCardSelect = {
  id: true, name: true, slug: true, modelNumber: true, shortDescription: true, availability: true, priceMode: true, price: true, currency: true,
  isFeatured: true, isNewArrival: true, isDemo: true,
  brand: { select: { name: true, slug: true } }, category: { select: { name: true, slug: true } },
  images: { select: { url: true, alt: true }, orderBy: { sortOrder: "asc" }, take: 1 },
  specifications: { select: { label: true, value: true }, orderBy: { sortOrder: "asc" }, take: 3 },
} satisfies Prisma.ProductSelect;
export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

export const getCategories = cache(() =>
  prisma.category.findMany({
    where: { isPublished: true, parentId: null }, orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { isPublished: true } } } }, children: { where: { isPublished: true }, orderBy: { sortOrder: "asc" } } },
  }));

export const getBrands = cache(() => prisma.brand.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }));
export const getServices = cache(() => prisma.service.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } }));

export const getFeaturedProducts = cache((take = 8) =>
  prisma.product.findMany({ where: { isPublished: true, isFeatured: true }, orderBy: { sortOrder: "asc" }, take, select: productCardSelect }));

export const getProjects = cache((take?: number) =>
  prisma.project.findMany({ where: { isPublished: true }, orderBy: [{ sortOrder: "asc" }, { completedAt: "desc" }], take, include: { images: { orderBy: { sortOrder: "asc" } } } }));

export const getTestimonials = cache(() => prisma.testimonial.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } }));

export const getPosts = cache((take?: number) =>
  prisma.blogPost.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take }));

export const getBanners = cache((placement: string) =>
  prisma.banner.findMany({ where: { placement, isActive: true }, orderBy: { sortOrder: "asc" } }));

export type CatalogQuery = { q?: string; category?: string; brand?: string; sort?: string; filter?: string; page?: number };
export const PAGE_SIZE = 12;

export async function searchProducts(query: CatalogQuery) {
  const where: Prisma.ProductWhereInput = { isPublished: true };
  if (query.category) where.category = { OR: [{ slug: query.category }, { parent: { slug: query.category } }] };
  if (query.brand) where.brand = { slug: query.brand };
  if (query.filter === "featured") where.isFeatured = true;
  if (query.filter === "new") where.isNewArrival = true;
  if (query.q) {
    const q = query.q.slice(0, 100);
    where.OR = [
      { name: { contains: q, mode: "insensitive" } }, { modelNumber: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } }, { brand: { name: { contains: q, mode: "insensitive" } } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ];
  }
  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    query.sort === "name" ? [{ name: "asc" }] : query.sort === "newest" ? [{ createdAt: "desc" }] : [{ isFeatured: "desc" }, { sortOrder: "asc" }];
  const page = Math.max(1, Math.min(500, query.page ?? 1));
  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE, select: productCardSelect }),
    prisma.product.count({ where }),
  ]);
  return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function siteSearch(q: string) {
  const term = q.trim().slice(0, 80);
  if (term.length < 2) return { products: [], categories: [], brands: [], services: [], posts: [] };
  const ci = { contains: term, mode: "insensitive" as const };
  const [products, categories, brands, services, posts] = await Promise.all([
    prisma.product.findMany({ where: { isPublished: true, OR: [{ name: ci }, { modelNumber: ci }, { brand: { name: ci } }, { shortDescription: ci }] }, take: 8, select: { name: true, slug: true, brand: { select: { name: true } }, images: { take: 1, select: { url: true } } } }),
    prisma.category.findMany({ where: { isPublished: true, OR: [{ name: ci }, { description: ci }] }, take: 5, select: { name: true, slug: true } }),
    prisma.brand.findMany({ where: { isActive: true, name: ci }, take: 5, select: { name: true, slug: true } }),
    prisma.service.findMany({ where: { isPublished: true, OR: [{ title: ci }, { summary: ci }] }, take: 5, select: { title: true, slug: true } }),
    prisma.blogPost.findMany({ where: { status: "PUBLISHED", OR: [{ title: ci }, { excerpt: ci }] }, take: 5, select: { title: true, slug: true } }),
  ]);
  return { products, categories, brands, services, posts };
}
