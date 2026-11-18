import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "./JsonLd";
import { absUrl } from "@/lib/seo";

export function PageHero({ eyebrow, title, body, crumbs = [], image, children }: { eyebrow?: string; title: ReactNode; body?: ReactNode; crumbs?: [string, string][]; image?: string; children?: ReactNode }) {
  const all: [string, string][] = [["Home", "/"], ...crumbs];
  return (
    <section className="relative overflow-hidden bg-ink pb-16 pt-32 text-white md:pb-20 md:pt-40">
      {image && <Image src={image} alt="" fill priority sizes="100vw" className="object-cover opacity-20" />}
      <div className="absolute inset-0 bg-[radial-gradient(900px_400px_at_80%_0%,rgba(8,101,197,.45),transparent_70%),radial-gradient(600px_300px_at_0%_100%,rgba(237,16,24,.15),transparent_70%)]" />
      <div className="absolute inset-0 grid-bg [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="container-x relative">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-white/50">
            {all.map(([l, h], i) => (
              <li key={h} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {i < all.length - 1 ? <Link href={h} className="hover:text-white">{l}</Link> : <span className="text-white/80" aria-current="page">{l}</span>}
              </li>
            ))}
          </ol>
        </nav>
        {eyebrow && <p className="eyebrow eyebrow-dot !text-glow">{eyebrow}</p>}
        <h1 className="display mt-4 max-w-4xl text-4xl md:text-6xl">{title}</h1>
        {body && <p className="mt-5 max-w-2xl text-lg text-white/65">{body}</p>}
        {children}
      </div>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: all.map(([name, h], i) => ({ "@type": "ListItem", position: i + 1, name, item: absUrl(h) })) }} />
    </section>
  );
}
