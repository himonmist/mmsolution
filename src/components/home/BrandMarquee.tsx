import Image from "next/image";
import Link from "next/link";

export function BrandMarquee({ brands }: { brands: { id: string; name: string; slug: string; logo: string | null }[] }) {
  const row = [...brands, ...brands];
  return (
    <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <ul className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
        {row.map((b, i) => (
          <li key={`${b.id}-${i}`} aria-hidden={i >= brands.length}>
            <Link href={`/products?brand=${b.slug}`} tabIndex={i >= brands.length ? -1 : 0}
              className="flex h-20 w-44 items-center justify-center rounded-2xl border border-line bg-white px-6 grayscale transition hover:grayscale-0 hover:shadow-card">
              {b.logo ? <Image src={b.logo} alt={b.name} width={120} height={40} className="max-h-9 w-auto object-contain" />
                : <span className="font-display text-xl font-bold tracking-tight text-navy">{b.name}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
