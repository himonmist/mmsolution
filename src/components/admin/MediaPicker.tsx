"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { uploadMediaAction } from "@/app/admin/actions";

export type MediaItem = { url: string; filename: string };

export function useUpload() {
  const [busy, setBusy] = useState(false);
  const upload = async (file: File): Promise<string | null> => {
    setBusy(true);
    try {
      const fd = new FormData(); fd.set("file", file);
      const r = await uploadMediaAction(fd);
      if (!r.ok) { alert(r.error); return null; }
      return r.url ?? null;
    } finally { setBusy(false); }
  };
  return { busy, upload };
}

export function MediaPicker({ value, onChange, media }: { value?: string | null; onChange: (url: string) => void; media: MediaItem[] }) {
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const { busy, upload } = useUpload();
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-28 overflow-hidden rounded-xl border border-line bg-mist">{value ? <Image src={value} alt="" fill sizes="112px" className="object-contain p-1" /> : <ImagePlus className="m-auto mt-6 h-6 w-6 text-slate" />}</div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => input.current?.click()} className="btn btn-outline !min-h-9 !py-1.5 !text-xs">{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}Upload</button>
          <button type="button" onClick={() => setOpen(true)} className="btn btn-outline !min-h-9 !py-1.5 !text-xs">Library</button>
          {value && <button type="button" onClick={() => onChange("")} className="btn !min-h-9 !py-1.5 !text-xs text-brand-red">Remove</button>}
        </div>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const u = await upload(f); if (u) onChange(u); } e.target.value = ""; }} />
      </div>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" onClick={() => setOpen(false)}>
          <div className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="font-bold">Media library</h3><button type="button" onClick={() => setOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button></div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {media.map((m) => (
                <button type="button" key={m.url} onClick={() => { onChange(m.url); setOpen(false); }} className="group text-left">
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-mist group-hover:border-brand-blue"><Image src={m.url} alt="" fill sizes="120px" className="object-contain p-1" /></div>
                  <p className="mt-1 truncate text-[11px] text-slate">{m.filename}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
