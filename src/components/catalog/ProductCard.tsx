import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProductCardData } from "@/lib/queries";
import { priceLabel } from "@/lib/price";
import { ProductVisual } from "./ProductVisual";
import { InquiryButton } from "@/components/forms/InquiryButton";

export const AVAILABILITY: Record<string, { label: string; cls: string } | null> = {
  IN_STOCK: { label: "In stock", cls: "bg-emerald-50 text-emerald-700" },
  LIMITED: { label: "Limited stock", cls: "bg-amber-50 text-amber-700" },
  PRE_ORDER: { label: "Pre-order", cls: "bg-sky-50 text-sky-700" },
  ON_REQUEST: { label: "Available on request", cls: "bg-mist text-navy" },
  OUT_OF_STOCK: { label: "Out of stock", cls: "bg-red-50 text-red-700" },
  UNSPECIFIED: null,
};

export function ProductCard({ p, icon }: { p: ProductCardData; icon?: string | null }) {
  const price = priceLabel({ priceMode: p.priceMode, price: p.price, currency: p.currency });
  const av = AVAILABILITY[p.availability];
  return (
    <article className="group card relative flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/products/${p.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-b from-mist to-white" aria-label={p.name}>
        <ProductVisual src={p.images[0]?.url} alt={p.images[0]?.alt ?? p.name} icon={icon} />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {p.isNewArrival && <span className="rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">New</span>}
          {p.isDemo && <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate ring-1 ring-line">Sample</span>}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-bold uppercase tracking-wider text-brand-blue">{p.brand?.name ?? p.category.name}</span>
          {p.modelNumber && <span className="truncate text-slate">{p.modelNumber}</span>}
        </div>
        <h3 className="mt-2 text-[15px] font-bold leading-snug text-ink"><Link href={`/products/${p.slug}`} className="hover:text-brand-blue">{p.name}</Link></h3>
        {p.shortDescription && <p className="mt-1.5 line-clamp-2 text-sm text-slate">{p.shortDescription}</p>}
        {p.specifications.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-slate">
            {p.specifications.map((s) => <li key={s.label} className="flex gap-1.5"><span className="font-semibold text-navy">{s.label}:</span><span className="truncate">{s.value}</span></li>)}
          </ul>
        )}
        <div className="mt-auto pt-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            {price ? <span className="text-sm font-bold text-ink">{price}</span> : <span />}
            {av && <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${av.cls}`}>{av.label}</span>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/products/${p.slug}`} className="btn btn-outline !min-h-10 !px-3 !py-2 !text-[13px]">Details <ArrowRight className="h-3.5 w-3.5" /></Link>
            <InquiryButton product={{ id: p.id, name: p.name }} className="btn btn-blue !min-h-10 !px-3 !py-2 !text-[13px]">Inquire</InquiryButton>
          </div>
        </div>
      </div>
    </article>
  );
}
