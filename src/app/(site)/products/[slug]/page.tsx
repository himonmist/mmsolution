import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Info, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/site/RichText";
import { JsonLd } from "@/components/site/JsonLd";
import { Gallery } from "@/components/catalog/Gallery";
import { ProductCard, AVAILABILITY } from "@/components/catalog/ProductCard";
import { InquiryButton } from "@/components/forms/InquiryButton";
import { WhatsappIcon, FacebookIcon, LinkedinIcon } from "@/components/ui/icons";
import { productCardSelect } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { priceLabel } from "@/lib/price";
import { whatsappLink } from "@/lib/whatsapp";
import { absUrl } from "@/lib/seo";
import { stripTags } from "@/lib/security/sanitize";
import { cache } from "react";

type Params = Promise<{ slug: string }>;
const getProduct = cache((slug: string) => prisma.product.findFirst({
  where: { slug, isPublished: true },
  include: { brand: true, category: true, images: { orderBy: { sortOrder: "asc" } }, specifications: { orderBy: { sortOrder: "asc" } } },
}));

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return { title: "Product not found" };
  const description = p.seoDescription ?? p.shortDescription ?? stripTags(p.description ?? "").slice(0, 160);
  return { title: p.seoTitle ?? p.name, description, alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title: p.name, description, images: p.images[0] ? [p.images[0].url] : undefined, type: "website" } };
}

export default async function ProductPage({ params }: { params: Params }) {
  const p = await getProduct((await params).slug);
  if (!p) notFound();
  const [s, related] = await Promise.all([
    getSettings(),
    prisma.product.findMany({ where: { isPublished: true, categoryId: p.categoryId, NOT: { id: p.id } }, take: 4, orderBy: { sortOrder: "asc" }, select: productCardSelect }),
  ]);
  const price = priceLabel({ priceMode: p.priceMode, price: p.price, currency: p.currency });
  const av = AVAILABILITY[p.availability];
  const url = absUrl(`/products/${p.slug}`);
  const wa = whatsappLink(s.contact.whatsapp, `Hello MM Business Solution, I'm interested in: ${p.name}${p.modelNumber ? ` (${p.modelNumber})` : ""}\n${url}`);
  const groups = p.specifications.reduce<Record<string, typeof p.specifications>>((acc, sp) => { (acc[sp.group ?? "Specifications"] ??= []).push(sp); return acc; }, {});
  const schema = {
    "@context": "https://schema.org", "@type": "Product", name: p.name, sku: p.modelNumber ?? undefined, url,
    image: p.images.map((i) => absUrl(i.url)), description: p.shortDescription ?? undefined, category: p.category.name,
    brand: p.brand ? { "@type": "Brand", name: p.brand.name } : undefined,
    ...(p.priceMode === "SHOW_PRICE" && p.price ? { offers: { "@type": "Offer", price: p.price.toString(), priceCurrency: p.currency, url,
      availability: p.availability === "IN_STOCK" ? "https://schema.org/InStock" : p.availability === "OUT_OF_STOCK" ? "https://schema.org/OutOfStock" : undefined } } : {}),
  };
  return (
    <>
      <PageHero eyebrow={p.category.name} title={p.name} crumbs={[["Products", "/products"], [p.category.name, `/products?category=${p.category.slug}`], [p.name, `/products/${p.slug}`]]} />
      <section className="bg-white py-12 md:py-16">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Gallery images={p.images} name={p.name} />
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {p.brand && <Link href={`/products?brand=${p.brand.slug}`} className="rounded-full bg-brand-blue/10 px-3 py-1 font-bold text-brand-blue">{p.brand.name}</Link>}
              {p.modelNumber && <span className="rounded-full bg-mist px-3 py-1 font-semibold text-navy">Model: {p.modelNumber}</span>}
              {av && <span className={`rounded-full px-3 py-1 font-semibold ${av.cls}`}>{av.label}</span>}
            </div>
            <h2 className="display mt-5 text-3xl text-ink md:text-4xl">{p.name}</h2>
            {p.shortDescription && <p className="mt-4 text-lg text-slate">{p.shortDescription}</p>}
            {price && <p className="mt-6 text-2xl font-bold text-ink">{price}</p>}
            {p.features.length > 0 && <ul className="mt-6 space-y-2">{p.features.map((f) => <li key={f} className="flex gap-2 text-ink"><Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />{f}</li>)}</ul>}
            <div className="mt-8 flex flex-wrap gap-3">
              <InquiryButton product={{ id: p.id, name: p.name }} className="btn btn-primary">Request Product Inquiry</InquiryButton>
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-white hover:bg-[#1fb857]"><WhatsappIcon className="h-5 w-5" />WhatsApp Inquiry</a>}
              <a href={`tel:${s.contact.phone.replace(/[^\d+]/g, "")}`} className="btn btn-outline"><Phone className="h-4 w-4" />Call us</a>
            </div>
            {p.isDemo && <p className="mt-6 flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"><Info className="mt-0.5 h-4 w-4 shrink-0" />Illustrative catalogue entry. Exact models, specifications and pricing are confirmed in your quotation.</p>}
            <div className="mt-8 flex items-center gap-2 border-t border-line pt-6 text-sm text-slate">
              Share:
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="grid h-9 w-9 place-items-center rounded-full bg-mist text-navy hover:text-brand-blue"><FacebookIcon className="h-4 w-4" /></a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="grid h-9 w-9 place-items-center rounded-full bg-mist text-navy hover:text-brand-blue"><LinkedinIcon className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
        <div className="container-x mt-16 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2"><h2 className="display mb-4 text-2xl text-ink">Overview</h2><RichText html={p.description} /></div>
          {p.specifications.length > 0 && (
            <div>
              <h2 className="display mb-4 text-2xl text-ink">Technical specifications</h2>
              {Object.entries(groups).map(([g, rows]) => (
                <div key={g} className="mb-4 overflow-hidden rounded-2xl border border-line">
                  {Object.keys(groups).length > 1 && <p className="bg-mist px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate">{g}</p>}
                  <dl className="divide-y divide-line">{rows.map((r) => <div key={r.id} className="grid grid-cols-5 gap-3 px-4 py-3 text-sm"><dt className="col-span-2 font-semibold text-navy">{r.label}</dt><dd className="col-span-3 text-ink">{r.value}</dd></div>)}</dl>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      {related.length > 0 && (
        <section className="bg-mist py-16">
          <div className="container-x">
            <h2 className="display mb-8 text-3xl text-ink">Related products</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} icon={p.category.icon} />)}</div>
          </div>
        </section>
      )}
      <JsonLd data={schema} />
    </>
  );
}
