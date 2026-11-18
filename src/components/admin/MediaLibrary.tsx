"use client";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, Trash2, Upload } from "lucide-react";
import { deleteMediaAction } from "@/app/admin/actions";
import { useUpload } from "./MediaPicker";

type M = { id: string; url: string; filename: string; width: number | null; height: number | null; sizeBytes: number };
export function MediaLibrary({ items }: { items: M[] }) {
  const { busy, upload } = useUpload();
  const [, start] = useTransition();
  const [copied, setCopied] = useState("");
  const router = useRouter();
  return (
    <>
      <label className="card mb-6 flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed p-10 text-center hover:border-brand-blue"
        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => { e.preventDefault(); for (const f of Array.from(e.dataTransfer.files).slice(0, 20)) await upload(f); router.refresh(); }}>
        {busy ? <Loader2 className="h-8 w-8 animate-spin text-brand-blue" /> : <Upload className="h-8 w-8 text-brand-blue" />}
        <span className="font-bold text-ink">Drop images here or click to upload</span>
        <span className="text-xs text-slate">JPEG, PNG, WebP, GIF or AVIF · max 8 MB · converted to optimised WebP, metadata removed</span>
        <input type="file" multiple hidden accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={async (e) => { for (const f of Array.from(e.target.files ?? []).slice(0, 20)) await upload(f); e.target.value = ""; router.refresh(); }} />
      </label>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((m) => (
          <div key={m.id} className="card overflow-hidden">
            <div className="relative aspect-square bg-mist"><Image src={m.url} alt="" fill sizes="200px" className="object-contain p-2" /></div>
            <div className="p-3">
              <p className="truncate text-xs font-semibold text-ink">{m.filename}</p>
              <p className="text-[11px] text-slate">{m.width}×{m.height} · {(m.sizeBytes / 1024).toFixed(0)} KB</p>
              <div className="mt-2 flex gap-1">
                <button onClick={() => { navigator.clipboard.writeText(m.url); setCopied(m.id); }} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-mist py-1.5 text-xs font-semibold"><Copy className="h-3 w-3" />{copied === m.id ? "Copied" : "URL"}</button>
                <button aria-label="Delete" onClick={() => confirm("Delete this image from the library?") && start(async () => { await deleteMediaAction(m.id); router.refresh(); })} className="rounded-lg px-2 text-brand-red hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <p className="text-center text-slate">No uploads yet.</p>}
    </>
  );
}
