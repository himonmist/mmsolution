import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { PageHeader, STATUS_STYLES, label } from "@/components/admin/ui";
import { InquiryControls } from "@/components/admin/InquiryControls";
import { WhatsappIcon } from "@/components/ui/icons";
import { whatsappLink } from "@/lib/whatsapp";

export default async function InquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("inquiries.view");
  const { id } = await params;
  const q = await prisma.inquiry.findUnique({ where: { id: id.slice(0, 40) }, include: { notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } }, product: { select: { slug: true } } } });
  if (!q) notFound();
  const staff = await prisma.user.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  const wa = q.phone ? whatsappLink(q.phone.replace(/^0/, "880"), `Hello ${q.name}, this is MM Business Solution regarding your inquiry${q.productName ? ` about ${q.productName}` : ""}.`) : null;
  const meta = (q.meta ?? {}) as Record<string, string>;
  return (
    <>
      <PageHeader title={q.name} desc={`${label(q.type)} · received ${q.createdAt.toLocaleString("en-GB")}`} back={["/admin/inquiries", "Inquiries"]}
        action={<span className={`rounded-full px-3 py-1 text-sm font-bold ${STATUS_STYLES[q.status]}`}>{label(q.status)}</span>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              {[["Company", q.company], ["Email", q.email], ["Phone", q.phone], ["Product", q.productName], ["Quantity", q.quantity], ["Subject", q.subject], ...Object.entries(meta).map(([k, v]) => [label(k), v])].filter(([, v]) => v).map(([k, v]) => (
                <div key={String(k)}><dt className="text-xs font-bold uppercase tracking-wider text-slate">{k}</dt><dd className="mt-1 break-words text-ink">{String(v)}</dd></div>
              ))}
            </dl>
            <div className="mt-6 border-t border-line pt-5"><p className="text-xs font-bold uppercase tracking-wider text-slate">Message</p>
              {/* Rendered as text (React escapes it) — never as HTML */}
              <p className="mt-2 whitespace-pre-wrap text-ink">{q.message}</p></div>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={`mailto:${q.email}?subject=${encodeURIComponent("Re: your inquiry — MM Business Solution")}`} className="btn btn-blue"><Mail className="h-4 w-4" />Reply by email</a>
              {q.phone && <a href={`tel:${q.phone.replace(/[^\d+]/g, "")}`} className="btn btn-outline"><Phone className="h-4 w-4" />Call</a>}
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-white"><WhatsappIcon className="h-4 w-4" />WhatsApp</a>}
            </div>
          </section>
          <section className="card p-6">
            <h2 className="mb-4 font-bold text-ink">Internal notes</h2>
            {q.notes.length === 0 ? <p className="text-sm text-slate">No notes yet.</p> : (
              <ul className="space-y-4">{q.notes.map((n) => <li key={n.id} className="rounded-xl bg-mist p-4"><p className="whitespace-pre-wrap text-sm text-ink">{n.body}</p><p className="mt-2 text-xs text-slate">{n.author?.name ?? "Former user"} · {n.createdAt.toLocaleString("en-GB")}</p></li>)}</ul>
            )}
          </section>
        </div>
        <aside className="card h-fit p-6"><InquiryControls id={q.id} status={q.status} assigneeId={q.assigneeId} staff={staff.map((s) => [s.id, s.name])} canManage={can(user.role, "inquiries.manage")} /></aside>
      </div>
    </>
  );
}
