import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { prisma } from "@/lib/db";
import { PageHero } from "@/components/site/PageHero";

export const metadata: Metadata = { title: "Brands", description: "Technology brands available through MM Business Solution.", alternates: { canonical: "/brands" } };

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: { where: { isPublished: true } } } } } });
  return (
    <>
      <PageHero eyebrow="Technology brands" title="Brands we work with" body="Genuine products from established technology manufacturers." crumbs={[["Brands", "/brands"]]} />
      <section className="bg-mist py-16">
        <div className="container-x grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((b) => (
            <Link key={b.id} href={`/products?brand=${b.slug}`} className="card group flex flex-col items-center p-8 text-center transition hover:-translate-y-1 hover:shadow-lift">
              <div className="grid h-16 place-items-center"><BrandMark name={b.name} slug={b.slug} logo={b.logo} size="lg" /></div>
              <p className="mt-3 text-sm text-slate">{b._count.products} {b._count.products === 1 ? "product" : "products"}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
