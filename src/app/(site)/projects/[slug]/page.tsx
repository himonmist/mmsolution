import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Calendar, Info } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/site/RichText";
import { FinalCta } from "@/components/home/Sections";

type Params = Promise<{ slug: string }>;
const get = cache((slug: string) => prisma.project.findFirst({ where: { slug, isPublished: true }, include: { images: { orderBy: { sortOrder: "asc" } } } }));

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await get((await params).slug);
  return p ? { title: p.title, description: p.summary ?? undefined, alternates: { canonical: `/projects/${p.slug}` } } : { title: "Not found" };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const p = await get((await params).slug);
  if (!p) notFound();
  return (
    <>
      <PageHero eyebrow={p.category} title={p.title} body={p.summary} crumbs={[["Projects", "/projects"], [p.title, `/projects/${p.slug}`]]} image={p.coverImage ?? undefined} />
      <section className="bg-white py-16">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {p.isDemo && <p className="mb-6 flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"><Info className="mt-0.5 h-4 w-4" />Sample project used for demonstration.</p>}
            <RichText html={p.description} />
            {p.implementationDetails && <><h2 className="display mb-3 mt-10 text-2xl text-ink">Implementation details</h2><RichText html={p.implementationDetails} /></>}
            {p.images.length > 0 && <div className="mt-10 grid gap-3 sm:grid-cols-2">{p.images.map((im) => <div key={im.id} className="relative aspect-[4/3] overflow-hidden rounded-2xl"><Image src={im.url} alt={im.alt ?? p.title} fill sizes="50vw" className="object-cover" /></div>)}</div>}
          </div>
          <aside className="lg:col-span-4">
            <dl className="card divide-y divide-line">
              {p.clientName && <div className="p-5"><dt className="text-xs font-bold uppercase tracking-wider text-slate">Client</dt><dd className="mt-1 font-bold text-ink">{p.clientName}</dd></div>}
              <div className="p-5"><dt className="text-xs font-bold uppercase tracking-wider text-slate">Category</dt><dd className="mt-1 font-bold text-ink">{p.category}</dd></div>
              {p.completedAt && <div className="p-5"><dt className="text-xs font-bold uppercase tracking-wider text-slate">Completed</dt><dd className="mt-1 flex items-center gap-2 font-bold text-ink"><Calendar className="h-4 w-4" />{p.completedAt.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</dd></div>}
              {p.technologies.length > 0 && <div className="p-5"><dt className="text-xs font-bold uppercase tracking-wider text-slate">Technologies</dt><dd className="mt-2 flex flex-wrap gap-1.5">{p.technologies.map((t) => <span key={t} className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-navy">{t}</span>)}</dd></div>}
            </dl>
          </aside>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
