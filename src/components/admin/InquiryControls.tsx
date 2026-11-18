"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateInquiryAction, addNoteAction } from "@/app/admin/actions";

const STATUSES = ["NEW", "IN_REVIEW", "QUOTATION_SENT", "IN_PROGRESS", "COMPLETED", "CLOSED"];
const lab = (s: string) => s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export function InquiryControls({ id, status, assigneeId, staff, canManage }: { id: string; status: string; assigneeId: string | null; staff: [string, string][]; canManage: boolean }) {
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) => start(async () => { const r = await fn(); setMsg(r.ok ? "Saved" : r.error ?? "Error"); if (r.ok) { after?.(); router.refresh(); } });
  if (!canManage) return <p className="text-sm text-slate">You have read-only access to inquiries.</p>;
  return (
    <div className="space-y-5">
      <div><label className="label" htmlFor="st">Status</label>
        <select id="st" defaultValue={status} onChange={(e) => run(() => updateInquiryAction(id, { status: e.target.value }))} className="field">{STATUSES.map((s) => <option key={s} value={s}>{lab(s)}</option>)}</select></div>
      <div><label className="label" htmlFor="as">Assigned to</label>
        <select id="as" defaultValue={assigneeId ?? ""} onChange={(e) => run(() => updateInquiryAction(id, { assigneeId: e.target.value || null }))} className="field"><option value="">Unassigned</option>{staff.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <form onSubmit={(e) => { e.preventDefault(); if (note.trim()) run(() => addNoteAction(id, note), () => setNote("")); }}>
        <label className="label" htmlFor="nt">Add internal note</label>
        <textarea id="nt" value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={4000} className="field" placeholder="Visible to staff only" />
        <button disabled={pending || !note.trim()} className="btn btn-blue mt-2">{pending && <Loader2 className="h-4 w-4 animate-spin" />}Add note</button>
      </form>
      {msg && <p className="text-sm text-slate" role="status">{msg}</p>}
    </div>
  );
}
