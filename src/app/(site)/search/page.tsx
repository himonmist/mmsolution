import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { siteSearch } from "@/lib/queries";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").slice(0, 80);
  const r = await siteSearch(q);
  const groups: [string, { l: string; h: string }[]][] = [
    ["Products", r.products.map((p) => ({ l: p.name, h: `/products/${p.slug}` }))],
    ["Categories", r.categories.map((c) => ({ l: c.name, h: `/products?category=${c.slug}` }))],
    ["Brands", r.brands.map((b) => ({ l: b.name, h: `/products?brand=${b.slug}` }))],
    ["Services", r.services.map((s) => ({ l: s.title, h: `/solutions/${s.slug}` }))],
    ["Articles", r.posts.map((p) => ({ l: p.title, h: `/news/${p.slug}` }))],
  ];
  const total = groups.reduce((n, [, g]) => n + g.length, 0);
  return (
    <>
      <PageHero title={q ? <>Results for “{q}”</> : "Search"} crumbs={[["Search", "/search"]]}>
        <form action="/search" className="mt-8 flex max-w-xl gap-2 rounded-full bg-white p-1.5 pl-5"><input name="q" defaultValue={q} maxLength={80} aria-label="Search" className="h-11 flex-1 bg-transparent text-ink outline-none" placeholder="Search products, brands, services…" /><button className="btn btn-primary !min-h-11">Search</button></form>
      </PageHero>
      <section className="container-x py-14">
        {q && total === 0 && <p className="text-slate">No results found.</p>}
        <div className="grid gap-8 md:grid-cols-2">
          {groups.map(([t, items]) => items.length > 0 && (
            <div key={t}><h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate">{t}</h2>
              <ul className="card divide-y divide-line">{items.map((i) => <li key={i.h}><Link href={i.h} className="block px-5 py-3 font-semibold text-ink hover:text-brand-blue">{i.l}</Link></li>)}</ul></div>
          ))}
        </div>
      </section>
    </>
  );
}
