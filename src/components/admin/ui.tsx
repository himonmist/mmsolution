import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({ title, desc, action, back }: { title: string; desc?: string; action?: ReactNode; back?: [string, string] }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {back && <Link href={back[0]} className="text-xs font-semibold text-slate hover:text-brand-blue">← {back[1]}</Link>}
        <h1 className="display mt-1 text-3xl text-ink">{title}</h1>
        {desc && <p className="mt-1 text-sm text-slate">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function Pill({ on, yes = "Yes", no = "No" }: { on: boolean; yes?: string; no?: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${on ? "bg-emerald-50 text-emerald-700" : "bg-slate/10 text-slate"}`}>{on ? yes : no}</span>;
}

export const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-brand-red/10 text-brand-red", IN_REVIEW: "bg-amber-50 text-amber-700", QUOTATION_SENT: "bg-sky-50 text-sky-700",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700", COMPLETED: "bg-emerald-50 text-emerald-700", CLOSED: "bg-slate/10 text-slate",
};
export const label = (s: string) => s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
