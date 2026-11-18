"use client";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, ArrowUp, Save } from "lucide-react";
import type { Field } from "@/lib/admin/fields";
import { saveResourceAction } from "@/app/admin/actions";
import { RichEditor } from "./RichEditor";
import { MediaPicker, useUpload, type MediaItem } from "./MediaPicker";

type Data = Record<string, unknown>;
type Spec = { label: string; value: string; group?: string };
type Img = { url: string; alt?: string };

export function ResourceForm({ resource, id, fields, initial, options, media }: {
  resource: string; id: string | null; fields: Field[]; initial: Data; options: Record<string, [string, string][]>; media: MediaItem[];
}) {
  const [data, setData] = useState<Data>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const set = (k: string, v: unknown) => setData((d) => ({ ...d, [k]: v }));

  function payload() {
    const out: Data = {};
    for (const f of fields) {
      let v = data[f.name];
      if (f.type === "checkbox") v = Boolean(v);
      else if (f.type === "number") v = v === "" || v === null || v === undefined ? (f.name === "price" ? "" : 0) : Number(v);
      else if (f.type === "list") v = Array.isArray(v) ? v : String(v ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
      else if (f.type === "specs") v = ((v as Spec[]) ?? []).filter((s) => s.label?.trim() && s.value?.trim()).map((s) => ({ label: s.label, value: s.value, group: s.group || "" }));
      else if (f.type === "images") v = ((v as Img[]) ?? []).map((i) => ({ url: i.url, alt: i.alt || "" }));
      else if (v === null || v === undefined) v = "";
      out[f.name] = v;
    }
    return out;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const r = await saveResourceAction(resource, id, payload());
      if (!r.ok) { setMsg({ ok: false, text: r.error ?? "Error" }); return; }
      setMsg({ ok: true, text: "Saved successfully." });
      if (!id && r.id) router.replace(`/admin/${resource}/${r.id}`);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
      <div className="card grid gap-5 p-6 sm:grid-cols-2 lg:col-span-2">
        {fields.filter((f) => f.type !== "checkbox").map((f) => (
          <div key={f.name} className={f.full || ["richtext", "specs", "images", "list"].includes(f.type) ? "sm:col-span-2" : ""}>
            <label className="label" htmlFor={`fld-${f.name}`}>{f.label}{f.required && <span className="text-brand-red"> *</span>}</label>
            <FieldInput f={f} value={data[f.name]} set={(v) => set(f.name, v)} options={f.relation ? options[f.relation] : f.options} media={media} />
            {f.help && <p className="mt-1 text-xs text-slate">{f.help}</p>}
          </div>
        ))}
      </div>
      <aside className="space-y-4">
        <div className="card sticky top-6 space-y-4 p-6">
          {fields.filter((f) => f.type === "checkbox").map((f) => (
            <label key={f.name} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-mist px-4 py-3">
              <span className="text-sm font-semibold text-ink">{f.label}</span>
              <input type="checkbox" checked={Boolean(data[f.name])} onChange={(e) => set(f.name, e.target.checked)} className="h-5 w-5 accent-brand-blue" />
            </label>
          ))}
          {msg && <p role="status" className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
          <button disabled={pending} className="btn btn-primary w-full">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{id ? "Save changes" : "Create"}</button>
        </div>
      </aside>
    </form>
  );
}

function FieldInput({ f, value, set, options, media }: { f: Field; value: unknown; set: (v: unknown) => void; options?: [string, string][]; media: MediaItem[] }) {
  const id = `fld-${f.name}`;
  switch (f.type) {
    case "textarea": return <textarea id={id} rows={3} maxLength={2000} required={f.required} value={String(value ?? "")} onChange={(e) => set(e.target.value)} className="field" />;
    case "richtext": return <RichEditor id={id} value={String(value ?? "")} onChange={set} />;
    case "number": return <input id={id} type="number" step="any" value={value === null || value === undefined ? "" : String(value)} onChange={(e) => set(e.target.value)} className="field" />;
    case "date": return <input id={id} type="date" value={String(value ?? "")} onChange={(e) => set(e.target.value)} className="field" />;
    case "select":
    case "relation":
      return (
        <select id={id} required={f.required} value={String(value ?? "")} onChange={(e) => set(e.target.value)} className="field">
          {(!f.required || f.type === "relation") && <option value="">{f.required ? "Select…" : "— None —"}</option>}
          {options?.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      );
    case "image": return <MediaPicker value={value as string} onChange={set} media={media} />;
    case "list": return <textarea id={id} rows={5} value={Array.isArray(value) ? value.join("\n") : String(value ?? "")} onChange={(e) => set(e.target.value.split("\n"))} className="field font-mono text-sm" />;
    case "specs": return <SpecsEditor value={(value as Spec[]) ?? []} set={set} />;
    case "images": return <ImagesEditor value={(value as Img[]) ?? []} set={set} media={media} />;
    default: return <input id={id} type="text" maxLength={300} required={f.required} value={String(value ?? "")} onChange={(e) => set(e.target.value)} className="field" />;
  }
}

function SpecsEditor({ value, set }: { value: Spec[]; set: (v: Spec[]) => void }) {
  const upd = (i: number, k: keyof Spec, v: string) => set(value.map((s, j) => (j === i ? { ...s, [k]: v } : s)));
  return (
    <div className="space-y-2">
      {value.map((s, i) => (
        <div key={i} className="grid grid-cols-[1fr_1.4fr_0.8fr_auto] gap-2">
          <input aria-label="Spec label" placeholder="Label (e.g. Processor)" value={s.label ?? ""} onChange={(e) => upd(i, "label", e.target.value)} maxLength={80} className="field !min-h-10 text-sm" />
          <input aria-label="Spec value" placeholder="Value" value={s.value ?? ""} onChange={(e) => upd(i, "value", e.target.value)} maxLength={400} className="field !min-h-10 text-sm" />
          <input aria-label="Spec group" placeholder="Group (opt.)" value={s.group ?? ""} onChange={(e) => upd(i, "group", e.target.value)} maxLength={60} className="field !min-h-10 text-sm" />
          <button type="button" aria-label="Remove" onClick={() => set(value.filter((_, j) => j !== i))} className="grid w-10 place-items-center rounded-lg text-brand-red hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      <button type="button" onClick={() => set([...value, { label: "", value: "" }])} className="btn btn-outline !min-h-9 !py-1.5 !text-xs"><Plus className="h-3.5 w-3.5" />Add specification</button>
    </div>
  );
}

function ImagesEditor({ value, set, media }: { value: Img[]; set: (v: Img[]) => void; media: MediaItem[] }) {
  const { busy, upload } = useUpload();
  const [pick, setPick] = useState("");
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {value.map((im, i) => (
          <div key={im.url + i} className="rounded-xl border border-line p-2">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-mist"><Image src={im.url} alt="" fill sizes="160px" className="object-contain p-1" />{i === 0 && <span className="absolute left-1 top-1 rounded bg-ink px-1.5 text-[10px] font-bold text-white">Main</span>}</div>
            <input aria-label="Alt text" placeholder="Alt text" value={im.alt ?? ""} onChange={(e) => set(value.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} maxLength={200} className="field mt-2 !min-h-8 !py-1 text-xs" />
            <div className="mt-1 flex justify-between">
              <button type="button" aria-label="Make main" disabled={i === 0} onClick={() => set([value[i], ...value.filter((_, j) => j !== i)])} className="rounded p-1 text-slate hover:text-brand-blue disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
              <button type="button" aria-label="Remove image" onClick={() => set(value.filter((_, j) => j !== i))} className="rounded p-1 text-brand-red"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="btn btn-outline !min-h-9 cursor-pointer !py-1.5 !text-xs">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}Upload images
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" hidden onChange={async (e) => {
            const files = Array.from(e.target.files ?? []).slice(0, 10); const added: Img[] = [];
            for (const f of files) { const u = await upload(f); if (u) added.push({ url: u }); }
            set([...value, ...added]); e.target.value = "";
          }} />
        </label>
        <select aria-label="Add from library" value={pick} onChange={(e) => { if (e.target.value) set([...value, { url: e.target.value }]); setPick(""); }} className="field !min-h-9 max-w-xs !py-1 text-xs">
          <option value="">Add from library…</option>
          {media.map((m) => <option key={m.url} value={m.url}>{m.filename}</option>)}
        </select>
      </div>
    </div>
  );
}
