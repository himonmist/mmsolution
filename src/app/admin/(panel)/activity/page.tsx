import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/ui";
export const metadata = { title: "Activity log" };

export default async function ActivityPage() {
  await requireUser("activity.view");
  const rows = await prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 300, include: { user: { select: { name: true, email: true } } } });
  return (
    <>
      <PageHeader title="Activity log" desc="Audit trail of sign-ins, content changes and exports (latest 300)." />
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-mist/60 text-xs uppercase tracking-wider text-slate"><tr><th className="px-4 py-3">When</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Entity</th><th className="px-4 py-3">Details</th></tr></thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id} className={r.action.startsWith("login_") ? "bg-amber-50/40" : ""}>
                <td className="whitespace-nowrap px-4 py-2.5 text-slate">{r.createdAt.toLocaleString("en-GB")}</td>
                <td className="px-4 py-2.5 text-ink">{r.user?.name ?? "—"}</td>
                <td className="px-4 py-2.5 font-semibold text-ink">{r.action.replace(/_/g, " ")}</td>
                <td className="px-4 py-2.5 text-slate">{r.entityType}</td>
                <td className="px-4 py-2.5 text-slate">{r.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
