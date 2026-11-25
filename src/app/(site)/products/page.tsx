import type { Metadata } from "next";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Icon } from "@/components/ui/icons";
import { getBrands, getCategories, searchProducts } from "@/lib/queries";

export const metadata: Metadata = { title: "Products", description: "Browse laptops, desktops, monitors, printers, networking, servers, CCTV, UPS and software from MM Business Solution.", alternates: { canonical: "/products" } };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.slice(0, 100);

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = { q: one(sp.q), category: one(sp.category), brand: one(sp.brand), sort: one(sp.sort), filter: one(sp.filter), page: Number(one(sp.page)) || 1 };
  const [cats, brands, res] = await Promise.all([getCategories(), getBrands(), searchProducts(q)]);
  const activeParent = cats.find((c) => c.slug === q.category || c.children.some((k) => k.slug === q.category));
  const activeCat = activeParent?.slug === q.category ? activeParent : activeParent?.children.find((k) => k.slug === q.category);
  const iconFor = Object.fromEntries(cats.map((c) => [c.slug, c.icon]));
  const href = (patch: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    const merged = { ...q, page: undefined, ...patch } as Record<string, unknown>;
    for (const [k, v] of Object.entries(merged)) if (v) u.set(k, String(v));
    const s = u.toString();
    return `/products${s ? `?${s}` : ""}`;
  };
  return (
    <>
      <PageHero eyebrow="Product catalogue" title={activeCat ? activeCat.name : "Every product your business runs on."}
        body={activeCat?.description ?? "Browse by category or brand, then send an inquiry — our team confirms specifications, availability and pricing in a formal quotation."}
        crumbs={activeCat ? [["Products", "/products"], ...(activeParent && activeParent.slug !== activeCat.slug ? [[activeParent.name, href({ category: activeParent.slug })] as [string, string]] : []), [activeCat.name, href({ category: activeCat.slug })]] : [["Products", "/products"]]}>
        <form action="/products" className="mt-8 flex max-w-xl items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-lift">
          <Search className="h-5 w-5 text-slate" />
          {q.category && <input type="hidden" name="category" value={q.category} />}
          <input name="q" defaultValue={q.q} maxLength={100} placeholder="Search by name, model or brand…" aria-label="Search products" className="h-11 flex-1 bg-transparent text-ink outline-none" />
          <button className="btn btn-primary !min-h-11">Search</button>
        </form>
      </PageHero>
      <section className="bg-mist py-12 md:py-16">
        <div className="container-x grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-4">
              <p className="mb-2 flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-widest text-slate"><SlidersHorizontal className="h-3.5 w-3.5" />Categories</p>
              <ul className="no-scrollbar flex gap-1 overflow-x-auto lg:block lg:space-y-0.5">
                <li><Link href={href({ category: undefined })} className={`flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-sm ${!q.category ? "bg-ink font-bold text-white" : "text-navy hover:bg-mist"}`}>All products</Link></li>
                {cats.map((c) => (
                  <li key={c.id}><Link href={href({ category: c.slug })} className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-2 py-2 text-sm ${q.category === c.slug ? "bg-ink font-bold text-white" : "text-navy hover:bg-mist"}`}>
                    <Icon name={c.icon} className="h-4 w-4 shrink-0 opacity-70" /><span className="flex-1">{c.name}</span><span className="text-xs opacity-60">{c._count.products}</span>
                  </Link>
                  {activeParent?.id === c.id && c.children.length > 0 && (
                    <ul className="hidden border-l border-line py-1 pl-3 ml-4 lg:block">
                      {c.children.map((k) => (
                        <li key={k.id}><Link href={href({ category: k.slug })} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] ${q.category === k.slug ? "font-bold text-brand-blue" : "text-navy hover:bg-mist"}`}><span className="flex-1">{k.name}</span><span className="text-xs opacity-60">{k._count.products}</span></Link></li>
                      ))}
                    </ul>
                  )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card hidden p-4 lg:block">
              <p className="mb-2 px-2 text-xs font-bold uppercase tracking-widest text-slate">Brands</p>
              <div className="flex flex-wrap gap-1.5">
                {brands.map((b) => <Link key={b.id} href={href({ brand: q.brand === b.slug ? undefined : b.slug })} className={`rounded-full border px-3 py-1 text-xs font-semibold ${q.brand === b.slug ? "border-brand-blue bg-brand-blue text-white" : "border-line text-navy hover:border-brand-blue"}`}>{b.name}</Link>)}
              </div>
            </div>
          </aside>
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate"><b className="text-ink">{res.total}</b> products{q.q && <> for “<b className="text-ink">{q.q}</b>”</>}</p>
              <div className="flex flex-wrap gap-1.5 text-sm">
                {[["", "All"], ["featured", "Featured"], ["new", "New arrivals"]].map(([v, l]) => (
                  <Link key={l} href={href({ filter: v || undefined })} className={`rounded-full px-3 py-1.5 font-semibold ${(q.filter ?? "") === v ? "bg-ink text-white" : "bg-white text-navy ring-1 ring-line"}`}>{l}</Link>
                ))}
                <span className="mx-1 w-px bg-line" />
                {[["", "Relevance"], ["newest", "Newest"], ["name", "A–Z"]].map(([v, l]) => (
                  <Link key={l} href={href({ sort: v || undefined })} className={`rounded-full px-3 py-1.5 font-semibold ${(q.sort ?? "") === v ? "bg-brand-blue text-white" : "bg-white text-navy ring-1 ring-line"}`}>{l}</Link>
                ))}
              </div>
            </div>
            {res.items.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{res.items.map((p) => <ProductCard key={p.id} p={p} icon={iconFor[p.category.slug]} />)}</div>
            ) : (
              <div className="card p-12 text-center"><p className="text-lg font-bold text-ink">No products match your filters.</p><p className="mt-2 text-slate">Our team can source most IT products — <Link href="/contact" className="text-brand-blue underline">send us an inquiry</Link>.</p></div>
            )}
            {res.pages > 1 && (
              <nav className="mt-8 flex justify-center gap-1" aria-label="Pagination">
                {Array.from({ length: res.pages }, (_, i) => i + 1).map((n) => (
                  <Link key={n} href={href({ page: String(n) })} aria-current={n === res.page ? "page" : undefined} className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold ${n === res.page ? "bg-ink text-white" : "bg-white text-navy ring-1 ring-line"}`}>{n}</Link>
                ))}
              </nav>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
