"use client";
import { useState, useTransition } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { saveSettingsAction } from "@/app/admin/actions";

export type SField = { key: string; label: string; type?: "text" | "textarea" | "checkbox" | "pillars" | "stats" | "link"; help?: string };

export function SettingsForm({ section, title, fields, initial }: { section: string; title: string; fields: SField[]; initial: Record<string, unknown> }) {
  const [v, setV] = useState<Record<string, unknown>>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (k: string, val: unknown) => setV((o) => ({ ...o, [k]: val }));
  return (
    <form className="card p-6" onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await saveSettingsAction(section, v); setMsg({ ok: r.ok, t: r.ok ? r.message! : r.error! }); }); }}>
      <h2 className="mb-5 font-bold text-ink">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => {
          const val = v[f.key];
          const full = f.type === "textarea" || f.type === "pillars" || f.type === "stats";
          return (
            <div key={f.key} className={full ? "sm:col-span-2" : ""}>
              {f.type === "checkbox" ? (
                <label className="flex items-center gap-3 rounded-xl bg-mist px-4 py-3 text-sm font-semibold"><input type="checkbox" checked={Boolean(val)} onChange={(e) => set(f.key, e.target.checked)} className="h-5 w-5 accent-brand-blue" />{f.label}</label>
              ) : (
                <>
                  <label className="label">{f.label}</label>
                  {f.type === "textarea" ? <textarea rows={4} value={String(val ?? "")} onChange={(e) => set(f.key, e.target.value)} className="field" />
                    : f.type === "link" ? (
                      <div className="grid grid-cols-2 gap-2">
                        <input aria-label={`${f.label} label`} placeholder="Label" value={(val as { label: string })?.label ?? ""} onChange={(e) => set(f.key, { ...(val as object), label: e.target.value })} className="field" />
                        <input aria-label={`${f.label} link`} placeholder="/path" value={(val as { href: string })?.href ?? ""} onChange={(e) => set(f.key, { ...(val as object), href: e.target.value })} className="field" />
                      </div>
                    ) : f.type === "pillars" ? <ListEditor rows={(val as Record<string, string>[]) ?? []} cols={[["title", "Title"], ["body", "Description"]]} onChange={(r) => set(f.key, r)} />
                    : f.type === "stats" ? <ListEditor rows={(val as Record<string, string>[]) ?? []} cols={[["label", "Label"], ["value", "Number"], ["suffix", "Suffix (+, %)"]]} onChange={(r) => set(f.key, r)} />
                    : <input value={String(val ?? "")} onChange={(e) => set(f.key, e.target.value)} className="field" />}
                </>
              )}
              {f.help && <p className="mt-1 text-xs text-slate">{f.help}</p>}
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button disabled={pending} className="btn btn-primary">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save</button>
        {msg && <span role="status" className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-700"}`}>{msg.t}</span>}
      </div>
    </form>
  );
}

function ListEditor({ rows, cols, onChange }: { rows: Record<string, string>[]; cols: [string, string][]; onChange: (r: Record<string, string>[]) => void }) {
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex gap-2">
          {cols.map(([k, l]) => <input key={k} aria-label={l} placeholder={l} value={r[k] ?? ""} onChange={(e) => onChange(rows.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)))} className="field !min-h-10 flex-1 text-sm" />)}
          <button type="button" aria-label="Remove" onClick={() => onChange(rows.filter((_, j) => j !== i))} className="px-2 text-brand-red"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...rows, {}])} className="btn btn-outline !min-h-9 !py-1.5 !text-xs"><Plus className="h-3.5 w-3.5" />Add row</button>
    </div>
  );
}
