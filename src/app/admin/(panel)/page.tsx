import Link from "next/link";
import { Package, FolderTree, Tag, Wrench, Briefcase, Inbox, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { PageHeader, STATUS_STYLES, label } from "@/components/admin/ui";

export const metadata = { title: "Dashboard" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser("dashboard.view");
  const sp = await searchParams;
  const [products, categories, brands, services, projects, newInq, recentInq, activity] = await Promise.all([
    prisma.product.count(), prisma.category.count(), prisma.brand.count(), prisma.service.count(), prisma.project.count(),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    can(user.role, "inquiries.view") ? prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6 }) : Promise.resolve([]),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: { select: { name: true } } } }),
  ]);
  const cards = [
    { l: "Products", v: products, I: Package, h: "/admin/products" }, { l: "Categories", v: categories, I: FolderTree, h: "/admin/categories" },
    { l: "Brands", v: brands, I: Tag, h: "/admin/brands" }, { l: "Services", v: services, I: Wrench, h: "/admin/services" },
    { l: "Projects", v: projects, I: Briefcase, h: "/admin/projects" }, { l: "New inquiries", v: newInq, I: Inbox, h: "/admin/inquiries?status=NEW", hot: true },
  ];
  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} desc="Here's what's happening on your website." />
      {sp.denied && <p className="mb-6 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">You don&apos;t have permission to open that section.</p>}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map(({ l, v, I, h, hot }) => (
          <Link key={l} href={h} className={`card p-5 transition hover:shadow-lift ${hot && v ? "ring-2 ring-brand-red/30" : ""}`}>
            <I className={`h-5 w-5 ${hot ? "text-brand-red" : "text-brand-blue"}`} />
            <p className="display mt-4 text-3xl text-ink">{v}</p>
            <p className="text-sm text-slate">{l}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {can(user.role, "inquiries.view") && (
          <section className="card p-6">
            <div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-ink">Recent inquiries</h2><Link href="/admin/inquiries" className="text-sm font-semibold text-brand-blue">View all <ArrowRight className="inline h-3.5 w-3.5" /></Link></div>
            <ul className="divide-y divide-line">
              {recentInq.length === 0 && <li className="py-6 text-center text-sm text-slate">No inquiries yet.</li>}
              {recentInq.map((q) => (
                <li key={q.id}><Link href={`/admin/inquiries/${q.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-mist/50">
                  <span className="min-w-0"><span className="block truncate font-semibold text-ink">{q.name}{q.company && <span className="font-normal text-slate"> · {q.company}</span>}</span><span className="block truncate text-xs text-slate">{label(q.type)} · {q.productName ?? q.subject ?? q.message.slice(0, 60)}</span></span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLES[q.status]}`}>{label(q.status)}</span>
                </Link></li>
              ))}
            </ul>
          </section>
        )}
        <section className="card p-6">
          <h2 className="mb-4 font-bold text-ink">Recent activity</h2>
          <ul className="space-y-3 text-sm">
            {activity.map((a) => (
              <li key={a.id} className="flex gap-3"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-blue" />
                <span><b className="text-ink">{a.user?.name ?? "System"}</b> <span className="text-slate">{a.action.replace(/_/g, " ")} {a.entityType}</span>{a.summary && <span className="text-ink"> — {a.summary}</span>}<br /><time className="text-xs text-slate">{a.createdAt.toLocaleString("en-GB")}</time></span></li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
