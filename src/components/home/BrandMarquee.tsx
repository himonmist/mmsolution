import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";

export function BrandMarquee({ brands }: { brands: { id: string; name: string; slug: string; logo: string | null }[] }) {
  const row = [...brands, ...brands];
  return (
    <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <ul className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
        {row.map((b, i) => (
          <li key={`${b.id}-${i}`} aria-hidden={i >= brands.length}>
            <Link href={`/products?brand=${b.slug}`} tabIndex={i >= brands.length ? -1 : 0} aria-label={`${b.name} products`}
              className="flex h-20 min-w-52 items-center justify-center rounded-2xl border border-line bg-white px-6 transition hover:-translate-y-0.5 hover:border-brand-blue/30 hover:shadow-card">
              <BrandMark name={b.name} slug={b.slug} logo={b.logo} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
