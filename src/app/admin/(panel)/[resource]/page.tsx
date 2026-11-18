import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { RESOURCES } from "@/lib/admin/fields";
import { PageHeader, Pill } from "@/components/admin/ui";
import { RowActions } from "@/components/admin/RowActions";

const DELEGATES: Record<string, () => { findMany: (a: object) => Promise<Record<string, unknown>[]>; count: (a: object) => Promise<number> }> = {
  products: () => prisma.product as never, categories: () => prisma.category as never, brands: () => prisma.brand as never, services: () => prisma.service as never,
  projects: () => prisma.project as never, testimonials: () => prisma.testimonial as never, posts: () => prisma.blogPost as never, pages: () => prisma.page as never, banners: () => prisma.banner as never,
};
const INCLUDE: Record<string, object> = { products: { category: { select: { name: true } }, brand: { select: { name: true } } }, categories: { parent: { select: { name: true } } } };
const get = (o: Record<string, unknown>, path: string) => path.split(".").reduce<unknown>((v, k) => (v as Record<string, unknown> | null)?.[k], o);

export default async function ResourceList({ params, searchParams }: { params: Promise<{ resource: string }>; searchParams: Promise<{ q?: string; page?: string }> }) {
  const { resource } = await params;
  const cfg = RESOURCES[resource];
  if (!cfg || !Object.hasOwn(RESOURCES, resource)) notFound();
  await requireUser(cfg.perm);
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 80);
  const page = Math.max(1, Number(sp.page) || 1);
  const where = q ? { [cfg.titleField]: { contains: q, mode: "insensitive" } } : {};
  const sortable = !["posts", "pages"].includes(resource);
  const d = DELEGATES[resource]();
  const [rows, total] = await Promise.all([
    d.findMany({ where, include: INCLUDE[resource], orderBy: sortable ? [{ sortOrder: "asc" }, { createdAt: "asc" }] : [{ updatedAt: "desc" }], take: 50, skip: (page - 1) * 50 }),
    d.count({ where }),
  ]);
  return (
    <>
      <PageHeader title={cfg.plural} desc={`${total} total`} action={<Link href={`/admin/${resource}/new`} className="btn btn-primary"><Plus className="h-4 w-4" />Add {cfg.label.toLowerCase()}</Link>} />
      <form className="mb-4"><input name="q" defaultValue={q} placeholder={`Search ${cfg.plural.toLowerCase()}…`} maxLength={80} className="field max-w-sm" /></form>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-mist/60 text-xs uppercase tracking-wider text-slate">
            <tr>{cfg.columns.map(([, l]) => <th key={l} className="px-4 py-3 font-bold">{l}</th>)}<th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && <tr><td colSpan={cfg.columns.length + 1} className="p-10 text-center text-slate">Nothing here yet.</td></tr>}
            {rows.map((r) => (
              <tr key={String(r.id)} className="hover:bg-mist/40">
                {cfg.columns.map(([k], i) => {
                  const v = get(r, k);
                  return (
                    <td key={k} className="px-4 py-3">
                      {i === 0 ? (
                        <span className="flex items-center gap-2">
                          <Link href={`/admin/${resource}/${r.id}`} className="font-semibold text-ink hover:text-brand-blue">{String(v ?? "—")}</Link>
                          {Boolean(r.isDemo) && <span className="rounded bg-amber-50 px-1.5 text-[10px] font-bold uppercase text-amber-700">sample</span>}
                          {cfg.publicPath && <a href={cfg.publicPath(r)} target="_blank" rel="noopener" aria-label="View on site" className="text-slate hover:text-brand-blue"><ExternalLink className="h-3.5 w-3.5" /></a>}
                        </span>
                      ) : typeof v === "boolean" ? <Pill on={v} /> : v === "PUBLISHED" ? <Pill on yes="Published" /> : v === "DRAFT" ? <Pill on={false} no="Draft" /> : <span className="text-slate">{String(v ?? "—")}</span>}
                    </td>
                  );
                })}
                <td className="px-4 py-2"><RowActions resource={resource} id={String(r.id)} name={String(r[cfg.titleField])} sortable={sortable} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total > 50 && <div className="mt-4 flex gap-2">{Array.from({ length: Math.ceil(total / 50) }, (_, i) => <Link key={i} href={`?page=${i + 1}&q=${encodeURIComponent(q)}`} className={`rounded-lg px-3 py-1.5 text-sm ${page === i + 1 ? "bg-ink text-white" : "bg-white"}`}>{i + 1}</Link>)}</div>}
    </>
  );
}
