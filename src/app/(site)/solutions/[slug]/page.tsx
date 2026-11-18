import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Check } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/site/RichText";
import { JsonLd } from "@/components/site/JsonLd";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { Icon } from "@/components/ui/icons";
import { absUrl } from "@/lib/seo";

type Params = Promise<{ slug: string }>;
const get = cache((slug: string) => prisma.service.findFirst({ where: { slug, isPublished: true } }));

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const s = await get((await params).slug);
  return s ? { title: s.seoTitle ?? s.title, description: s.seoDescription ?? s.summary ?? undefined, alternates: { canonical: `/solutions/${s.slug}` } } : { title: "Not found" };
}

export default async function ServicePage({ params }: { params: Params }) {
  const s = await get((await params).slug);
  if (!s) notFound();
  const others = await prisma.service.findMany({ where: { isPublished: true, NOT: { id: s.id } }, orderBy: { sortOrder: "asc" } });
  const type = /network|cctv|server|infrastructure/i.test(s.slug) ? "NETWORKING_PROJECT" : "CORPORATE_QUOTE";
  return (
    <>
      <PageHero eyebrow="Service" title={s.title} body={s.summary} crumbs={[["Solutions & Services", "/solutions"], [s.title, `/solutions/${s.slug}`]]} image={s.image ?? undefined} />
      <section className="bg-white py-16">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="mb-8 grid gap-3 sm:grid-cols-2">{s.features.map((f) => <div key={f} className="flex gap-3 rounded-2xl bg-mist p-4 font-semibold text-ink"><Check className="h-5 w-5 shrink-0 text-brand-blue" />{f}</div>)}</div>
            <RichText html={s.description} />
            <div className="mt-12">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate">Other services</p>
              <div className="flex flex-wrap gap-2">{others.map((o) => <Link key={o.id} href={`/solutions/${o.slug}`} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-navy hover:border-brand-blue"><Icon name={o.icon} className="h-4 w-4" />{o.title}</Link>)}</div>
            </div>
          </div>
          <aside className="lg:col-span-5">
            <div className="card p-6 lg:sticky lg:top-24 md:p-8">
              <p className="eyebrow eyebrow-dot">Service inquiry</p>
              <h2 className="display mt-2 text-2xl text-ink">Discuss your {s.title.toLowerCase()} needs</h2>
              <div className="mt-6"><InquiryForm type={type} compact /></div>
            </div>
          </aside>
        </div>
      </section>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", name: s.title, description: s.summary, url: absUrl(`/solutions/${s.slug}`), provider: { "@type": "Organization", name: "MM Business Solution" }, areaServed: "BD" }} />
    </>
  );
}
