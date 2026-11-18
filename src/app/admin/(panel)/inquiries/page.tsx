import Link from "next/link";
import { Download } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { inquiryWhere } from "@/lib/services/inquiries";
import { INQUIRY_STATUSES, INQUIRY_TYPES } from "@/lib/validation";
import { PageHeader, STATUS_STYLES, label } from "@/components/admin/ui";

export const metadata = { title: "Inquiries" };

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string; type?: string; q?: string; page?: string }> }) {
  const user = await requireUser("inquiries.view");
  const sp = await searchParams;
  const f = { status: sp.status, type: sp.type, q: sp.q?.slice(0, 100) };
  const page = Math.max(1, Number(sp.page) || 1);
  const where = inquiryWhere(f);
  const [rows, total, counts] = await Promise.all([
    prisma.inquiry.findMany({ where, orderBy: { createdAt: "desc" }, take: 30, skip: (page - 1) * 30, include: { assignee: { select: { name: true } } } }),
    prisma.inquiry.count({ where }),
    prisma.inquiry.groupBy({ by: ["status"], _count: true }),
  ]);
  const qs = (patch: Record<string, string | undefined>) => { const u = new URLSearchParams(); for (const [k, v] of Object.entries({ ...f, ...patch })) if (v) u.set(k, v); return `?${u}`; };
  return (
    <>
      <PageHeader title="Inquiries" desc={`${total} matching`} action={can(user.role, "inquiries.export") && <a href={`/admin/export${qs({})}`} className="btn btn-outline"><Download className="h-4 w-4" />Export CSV</a>} />
      <div className="mb-4 flex flex-wrap gap-1.5">
        <Link href={qs({ status: undefined })} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${!f.status ? "bg-ink text-white" : "bg-white ring-1 ring-line"}`}>All</Link>
        {INQUIRY_STATUSES.map((s) => <Link key={s} href={qs({ status: s })} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${f.status === s ? "bg-ink text-white" : "bg-white ring-1 ring-line"}`}>{label(s)} <span className="opacity-60">{counts.find((c) => c.status === s)?._count ?? 0}</span></Link>)}
      </div>
      <form className="mb-4 flex flex-wrap gap-2">
        {f.status && <input type="hidden" name="status" value={f.status} />}
        <input name="q" defaultValue={f.q} placeholder="Search name, email, company, product…" maxLength={100} className="field max-w-sm" />
        <select name="type" defaultValue={f.type ?? ""} className="field max-w-xs"><option value="">All types</option>{INQUIRY_TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}</select>
        <button className="btn btn-blue">Filter</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-mist/60 text-xs uppercase tracking-wider text-slate"><tr><th className="px-4 py-3">Received</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Regarding</th><th className="px-4 py-3">Assignee</th><th className="px-4 py-3">Status</th></tr></thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-slate">No inquiries found.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-mist/40">
                <td className="whitespace-nowrap px-4 py-3 text-slate">{r.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</td>
                <td className="px-4 py-3"><Link href={`/admin/inquiries/${r.id}`} className="font-semibold text-ink hover:text-brand-blue">{r.name}</Link><div className="text-xs text-slate">{r.company ?? r.email}</div></td>
                <td className="px-4 py-3 text-slate">{label(r.type)}</td>
                <td className="max-w-xs truncate px-4 py-3 text-slate">{r.productName ?? r.subject ?? r.message}</td>
                <td className="px-4 py-3 text-slate">{r.assignee?.name ?? "—"}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLES[r.status]}`}>{label(r.status)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total > 30 && <div className="mt-4 flex gap-2">{Array.from({ length: Math.ceil(total / 30) }, (_, i) => <Link key={i} href={qs({ page: String(i + 1) })} className={`rounded-lg px-3 py-1.5 text-sm ${page === i + 1 ? "bg-ink text-white" : "bg-white"}`}>{i + 1}</Link>)}</div>}
    </>
  );
}
