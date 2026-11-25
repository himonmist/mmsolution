import Image from "next/image";
import { BRAND_ICONS } from "@/lib/brand-icons";

/** Brand logo + name. Priority: uploaded CMS logo → Simple Icons mark → monogram badge. */
export function BrandMark({ name, slug, logo, size = "md" }: { name: string; slug: string; logo?: string | null; size?: "md" | "lg" }) {
  const icon = BRAND_ICONS[slug];
  const box = size === "lg" ? "h-12 w-12" : "h-9 w-9";
  const text = size === "lg" ? "text-xl" : "text-[15px]";
  // Very dark brand colours (e.g. ASUS black) stay readable on white; keep them as-is.
  const mark = logo ? (
    <Image src={logo} alt="" width={96} height={96} className={`${box} object-contain`} />
  ) : icon ? (
    <svg viewBox={icon.viewBox ?? "0 0 24 24"} className={icon.wide ? (size === "lg" ? "h-6 w-auto" : "h-[18px] w-auto") : box} role="img" aria-hidden fill={icon.hex}>{(Array.isArray(icon.path) ? icon.path : [icon.path]).map((d, i) => <path key={i} d={d} />)}</svg>
  ) : (
    <span className={`${box} grid place-items-center rounded-xl bg-gradient-to-br from-navy to-brand-blue font-display text-sm font-bold text-white`} aria-hidden>
      {(name.length <= 3 ? name : name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2)).toUpperCase()}
    </span>
  );
  return (
    <span className="flex items-center gap-3">
      {mark}
      <span className={`font-display ${text} font-bold tracking-tight text-navy`}>{name}</span>
    </span>
  );
}
