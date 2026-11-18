"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { deleteResourceAction, moveResourceAction } from "@/app/admin/actions";

export function RowActions({ resource, id, name, sortable }: { resource: string; id: string; name: string; sortable: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => start(async () => { const r = await fn(); if (!r.ok) alert(r.error); router.refresh(); });
  return (
    <div className={`flex justify-end gap-1 ${pending ? "opacity-50" : ""}`}>
      {sortable && <>
        <button title="Move up" aria-label="Move up" onClick={() => run(() => moveResourceAction(resource, id, "up"))} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-mist"><ArrowUp className="h-4 w-4" /></button>
        <button title="Move down" aria-label="Move down" onClick={() => run(() => moveResourceAction(resource, id, "down"))} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-mist"><ArrowDown className="h-4 w-4" /></button>
      </>}
      <button title="Delete" aria-label={`Delete ${name}`} onClick={() => confirm(`Delete “${name}”? This cannot be undone.`) && run(() => deleteResourceAction(resource, id))} className="grid h-8 w-8 place-items-center rounded-lg text-brand-red hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}
