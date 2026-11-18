import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { RESOURCES } from "@/lib/admin/fields";
import { PageHeader } from "@/components/admin/ui";
import { ResourceForm } from "@/components/admin/ResourceForm";

const FIND: Record<string, (id: string) => Promise<Record<string, unknown> | null>> = {
  products: (id) => prisma.product.findUnique({ where: { id }, include: { specifications: { orderBy: { sortOrder: "asc" } }, images: { orderBy: { sortOrder: "asc" } } } }) as never,
  categories: (id) => prisma.category.findUnique({ where: { id } }) as never,
  brands: (id) => prisma.brand.findUnique({ where: { id } }) as never,
  services: (id) => prisma.service.findUnique({ where: { id } }) as never,
  projects: (id) => prisma.project.findUnique({ where: { id } }) as never,
  testimonials: (id) => prisma.testimonial.findUnique({ where: { id } }) as never,
  posts: (id) => prisma.blogPost.findUnique({ where: { id } }) as never,
  pages: (id) => prisma.page.findUnique({ where: { id } }) as never,
  banners: (id) => prisma.banner.findUnique({ where: { id } }) as never,
};

const DEFAULTS: Record<string, Record<string, unknown>> = {
  products: { isPublished: false, priceMode: "REQUEST_QUOTE", availability: "UNSPECIFIED", features: [], specifications: [], images: [] },
  categories: { isPublished: true }, brands: { isActive: true }, services: { isPublished: true, features: [] }, projects: { technologies: [] },
  posts: { status: "DRAFT", category: "Insights" }, pages: { status: "DRAFT" }, banners: { isActive: true, placement: "home_top" },
};

export default async function EditResource({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  const cfg = RESOURCES[resource];
  if (!cfg || !Object.hasOwn(RESOURCES, resource)) notFound();
  await requireUser(cfg.perm);
  const isNew = id === "new";
  const row = isNew ? DEFAULTS[resource] ?? {} : await FIND[resource](id.slice(0, 40));
  if (!row) notFound();
  const [categories, brands, media] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.brand.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 60, select: { url: true, filename: true } }),
  ]);
  const initial = JSON.parse(JSON.stringify(row, (k, v) => (k === "price" && v != null ? Number(v) : v)));
  if (initial.completedAt) initial.completedAt = String(initial.completedAt).slice(0, 10);
  const studio = ["laptop", "laptop-graphite", "desktop", "tower", "monitor", "components", "printer", "accesspoint", "server", "rack", "switch", "router", "camera", "accessories", "ups", "shield"].map((k) => ({ url: `/media/studio/${k}.webp`, filename: `Studio: ${k}` }));
  const stock = ["laptop-performance", "workstation-set", "server-rack"].map((k) => ({ url: `/media/${k}.webp`, filename: `Photo: ${k}` }));
  return (
    <>
      <PageHeader title={isNew ? `New ${cfg.label.toLowerCase()}` : String(row[cfg.titleField] ?? cfg.label)} back={[`/admin/${resource}`, cfg.plural]} />
      <ResourceForm resource={resource} id={isNew ? null : id} fields={cfg.fields} initial={initial}
        options={{ categories: categories.map((c) => [c.id, c.name]), brands: brands.map((b) => [b.id, b.name]) }}
        media={[...media, ...stock, ...studio]} />
    </>
  );
}
