import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { ROLES, ROLE_LABELS, ROLE_PERMISSIONS } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/admin/ui";
import { UsersAdmin } from "@/components/admin/UsersAdmin";
export const metadata = { title: "Users & roles" };

export default async function UsersPage() {
  const me = await requireUser("users.manage");
  const users = await prisma.user.findMany({ include: { role: true }, orderBy: { createdAt: "asc" } });
  return (
    <>
      <PageHeader title="Users & roles" desc="Role-based access control. Only Super Administrators can manage users." />
      <UsersAdmin me={me.id} roles={ROLES.map((r) => [r, ROLE_LABELS[r]])} users={users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role.key, isActive: u.isActive, lastLoginAt: u.lastLoginAt?.toISOString() ?? null }))} />
      <h2 className="mb-3 mt-10 font-bold text-ink">Role permissions</h2>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ROLES.map((r) => <div key={r} className="card p-5"><p className="font-bold text-ink">{ROLE_LABELS[r]}</p><div className="mt-3 flex flex-wrap gap-1">{ROLE_PERMISSIONS[r].map((p) => <span key={p} className="rounded bg-mist px-1.5 py-0.5 text-[11px] text-navy">{p}</span>)}</div></div>)}
      </div>
    </>
  );
}
