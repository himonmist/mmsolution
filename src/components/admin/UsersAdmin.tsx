"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { saveUserAction, toggleUserAction } from "@/app/admin/actions";

type U = { id: string; name: string; email: string; role: string; isActive: boolean; lastLoginAt: string | null };
export function UsersAdmin({ users, roles, me }: { users: U[]; roles: [string, string][]; me: string }) {
  const [edit, setEdit] = useState<Partial<U> & { password?: string } | null>(null);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <>
      <button onClick={() => { setEdit({ role: "content_editor" }); setErr(""); }} className="btn btn-primary mb-4"><UserPlus className="h-4 w-4" />Add user</button>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-mist/60 text-xs uppercase tracking-wider text-slate"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Last login</th><th className="px-4 py-3">Status</th><th /></tr></thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3"><b className="text-ink">{u.name}</b><div className="text-xs text-slate">{u.email}</div></td>
                <td className="px-4 py-3 text-slate">{roles.find(([k]) => k === u.role)?.[1]}</td>
                <td className="px-4 py-3 text-slate">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("en-GB") : "Never"}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${u.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate/10 text-slate"}`}>{u.isActive ? "Active" : "Disabled"}</span></td>
                <td className="space-x-2 px-4 py-3 text-right">
                  <button onClick={() => { setEdit(u); setErr(""); }} className="font-semibold text-brand-blue">Edit</button>
                  {u.id !== me && <button onClick={() => start(async () => { const r = await toggleUserAction(u.id); if (!r.ok) alert(r.error); router.refresh(); })} className="font-semibold text-slate">{u.isActive ? "Disable" : "Enable"}</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" onClick={() => setEdit(null)}>
          <form onClick={(e) => e.stopPropagation()} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6"
            onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await saveUserAction(edit.id ?? null, { name: edit.name, email: edit.email, role: edit.role, password: edit.password || undefined }); if (!r.ok) setErr(r.error!); else { setEdit(null); router.refresh(); } }); }}>
            <h2 className="font-bold text-ink">{edit.id ? "Edit user" : "New user"}</h2>
            {err && <p role="alert" className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{err}</p>}
            <div><label className="label" htmlFor="u-n">Name</label><input id="u-n" required value={edit.name ?? ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className="field" /></div>
            <div><label className="label" htmlFor="u-e">Email</label><input id="u-e" type="email" required value={edit.email ?? ""} onChange={(e) => setEdit({ ...edit, email: e.target.value })} className="field" /></div>
            <div><label className="label" htmlFor="u-r">Role</label><select id="u-r" value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })} className="field">{roles.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
            <div><label className="label" htmlFor="u-p">{edit.id ? "New password (optional)" : "Password"}</label><input id="u-p" type="password" required={!edit.id} minLength={12} maxLength={72} autoComplete="new-password" value={edit.password ?? ""} onChange={(e) => setEdit({ ...edit, password: e.target.value })} className="field" /><p className="mt-1 text-xs text-slate">≥ 12 chars, mix of upper/lower case, numbers, symbols. Changing it signs the user out everywhere.</p></div>
            <div className="flex gap-2"><button disabled={pending} className="btn btn-primary">{pending && <Loader2 className="h-4 w-4 animate-spin" />}Save</button><button type="button" onClick={() => setEdit(null)} className="btn btn-outline">Cancel</button></div>
          </form>
        </div>
      )}
    </>
  );
}
