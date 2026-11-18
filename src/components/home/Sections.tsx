import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Quote } from "lucide-react";
import { Icon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Counter } from "@/components/ui/Counter";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { ProductCardData } from "@/lib/queries";
import type { Settings } from "@/lib/settings";
import { ProjectGrid } from "./ProjectGrid";
import { BrandMarquee } from "./BrandMarquee";

type Cat = { id: string; name: string; slug: string; description: string | null; image: string | null; icon: string | null; _count: { products: number } };

export function IntroSection({ intro, stats }: { intro: Settings["intro"]; stats: { label: string; value: number; suffix?: string }[] }) {
  const icons = ["boxes", "wrench", "support"];
  return (
    <section className="relative overflow-hidden bg-white py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 grid-bg-light [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      <div className="container-x relative">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <p className="eyebrow eyebrow-dot">About MM Business Solution</p>
            <h2 className="display mt-4 text-4xl text-ink md:text-[3.4rem]">{intro.heading}</h2>
          </Reveal>
          <Reveal className="lg:col-span-5 lg:col-start-8 lg:pt-10" delay={0.1}>
            <p className="text-lg leading-relaxed text-slate">{intro.body}</p>
            <Link href="/about" className="mt-6 inline-flex items-center gap-2 font-bold text-brand-blue hover:gap-3">More about us <ArrowRight className="h-4 w-4" /></Link>
          </Reveal>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {intro.pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="group card relative h-full overflow-hidden p-7 transition hover:-translate-y-1 hover:shadow-lift">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-blue/5 transition group-hover:scale-150" />
                <span className={`relative grid h-12 w-12 place-items-center rounded-2xl ${i === 1 ? "bg-brand-red/10 text-brand-red" : "bg-brand-blue/10 text-brand-blue"}`}><Icon name={icons[i]} className="h-6 w-6" /></span>
                <h3 className="relative mt-6 text-xl font-bold text-ink">{p.title}</h3>
                <p className="relative mt-2 text-slate">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        {stats.length > 0 && (
          <Reveal className="mt-16">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-line md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-white p-7">
                  <dt className="text-sm font-semibold text-slate">{s.label}</dt>
                  <dd className="display mt-2 text-4xl text-ink md:text-5xl"><Counter value={s.value} suffix={s.suffix} /></dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function CategoriesSection({ categories }: { categories: Cat[] }) {
  return (
    <section className="bg-mist py-24 md:py-32" id="categories">
      <div className="container-x">
        <SectionHeading eyebrow="Product categories" title={<>Explore our <span className="text-brand-blue">product range.</span></>}
          body="Twelve product lines covering every layer of a modern office — from the desk to the data rack."
          action={<Link href="/products" className="btn btn-outline">View full catalogue <ArrowRight className="h-4 w-4" /></Link>} />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={(i % 4) * 0.05}>
              <Link href={`/products?category=${c.slug}`} className="group relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-line bg-white transition duration-300 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-lift">
                <div className="relative aspect-[5/4] overflow-hidden bg-[radial-gradient(circle_at_50%_60%,#ffffff,#eaf1fa)]">
                  {c.image ? (
                    <Image src={c.image} alt="" fill sizes="(max-width:768px) 50vw, 25vw" className="object-contain p-4 transition duration-700 group-hover:scale-110 sm:p-6" />
                  ) : (
                    <div className="grid h-full place-items-center"><Icon name={c.icon} className="h-14 w-14 text-brand-blue/50" /></div>
                  )}
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-navy shadow-card">{c._count.products} products</span>
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <Icon name={c.icon} className="h-4 w-4 text-brand-red" />
                    <h3 className="text-[15px] font-bold text-ink sm:text-base">{c.name}</h3>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[13px] text-slate sm:text-sm">{c.description}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-3 text-[13px] font-bold text-brand-blue">Explore products <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedSection({ products, iconFor }: { products: ProductCardData[]; iconFor: Record<string, string | null> }) {
  if (!products.length) return null;
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="container-x">
        <SectionHeading eyebrow="Featured products" title={<>Built for business. <span className="text-slate/60">Ready to quote.</span></>}
          body="A preview of our catalogue. Specifications and availability are confirmed with every quotation."
          action={<Link href="/products?filter=featured" className="btn btn-outline">All featured <ArrowRight className="h-4 w-4" /></Link>} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => <Reveal key={p.id} delay={(i % 4) * 0.06}><ProductCard p={p} icon={iconFor[p.category.slug]} /></Reveal>)}
        </div>
      </div>
    </section>
  );
}

type Svc = { id: string; title: string; slug: string; summary: string | null; icon: string | null; image: string | null; features: string[] };
export function ServicesSection({ services }: { services: Svc[] }) {
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-white md:py-32">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-70" />
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-brand-blue/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-brand-red/15 blur-3xl" />
      <div className="container-x relative">
        <SectionHeading dark eyebrow="IT solutions & professional services" title={<>We don&apos;t just supply it.<br /><span className="text-white/50">We build it.</span></>}
          action={<Link href="/solutions" className="btn btn-ghost">All solutions <ArrowRight className="h-4 w-4" /></Link>} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.06} className={i < 2 ? "lg:col-span-3" : "lg:col-span-2"}>
              <Link href={`/solutions/${s.slug}`} className="group glass relative flex h-full flex-col overflow-hidden rounded-3xl p-7 transition hover:border-glow/40 hover:bg-white/[0.09]">
                {s.image && i < 2 && (
                  <div className="absolute inset-0 opacity-25 transition duration-700 group-hover:scale-105 group-hover:opacity-35">
                    <Image src={s.image} alt="" fill sizes="50vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
                  </div>
                )}
                <div className="relative">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-glow transition group-hover:bg-brand-red group-hover:text-white"><Icon name={s.icon} className="h-6 w-6" /></span>
                  <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{s.summary}</p>
                  <ul className="mt-5 space-y-2">
                    {s.features.slice(0, i < 2 ? 5 : 3).map((f) => <li key={f} className="flex gap-2 text-sm text-white/80"><Check className="mt-0.5 h-4 w-4 shrink-0 text-glow" />{f}</li>)}
                  </ul>
                </div>
                <span className="relative mt-auto inline-flex items-center gap-1 pt-6 text-sm font-bold text-white">View service <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const WHY = [
  { icon: "boxes", title: "Reliable IT Product Sourcing", body: "Genuine products through established distribution channels, with warranty documentation." },
  { icon: "headset", title: "Professional Technical Team", body: "Engineers who plan, install and configure — not just deliver boxes." },
  { icon: "settings", title: "Customized Business Solutions", body: "Recommendations sized to your users, budget and growth plans." },
  { icon: "award", title: "Quality-Focused Implementation", body: "Clean cabling, labelling, testing and hand-over documentation." },
  { icon: "clipboard", title: "Competitive Business Proposals", body: "Clear, itemised quotations that procurement teams can approve fast." },
  { icon: "support", title: "Long-Term Technical Support", body: "Maintenance and support that continues long after installation." },
];
export function WhySection() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionHeading eyebrow="Why MM Business Solution" title={<>A partner your IT team <span className="text-brand-red">can rely on.</span></>}
              body="Procurement, implementation and support from one accountable team — so your projects run on time and your systems stay up." />
            <Reveal><div className="relative aspect-[4/3] overflow-hidden rounded-3xl"><Image src="/media/server-rack-sm.webp" alt="Organised server rack installation" fill sizes="(max-width:1024px) 100vw, 40vw" className="object-cover" /></div></Reveal>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={(i % 2) * 0.08}>
              <div className="group h-full rounded-3xl border border-line p-7 transition hover:border-transparent hover:bg-mist">
                <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-blue to-navy text-white shadow-lg shadow-brand-blue/20 transition duration-500 group-hover:rotate-[8deg] group-hover:scale-110">
                  <Icon name={w.icon} className="h-6 w-6" />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-brand-red ring-4 ring-white transition group-hover:ring-mist" />
                </span>
                <h3 className="mt-6 text-lg font-bold text-ink">{w.title}</h3>
                <p className="mt-2 text-slate">{w.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BrandsSection({ brands }: { brands: { id: string; name: string; slug: string; logo: string | null }[] }) {
  if (!brands.length) return null;
  return (
    <section className="border-y border-line bg-mist py-20">
      <div className="container-x">
        <Reveal className="mb-10 flex flex-col items-center text-center">
          <p className="eyebrow eyebrow-dot">Technology brands</p>
          <h2 className="display mt-3 text-3xl text-ink md:text-4xl">Brands we work with</h2>
        </Reveal>
      </div>
      <BrandMarquee brands={brands} />
    </section>
  );
}

export function ProjectsSection({ projects }: { projects: Parameters<typeof ProjectGrid>[0]["projects"] }) {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="container-x">
        <SectionHeading eyebrow="Projects & implementations" title={<>Infrastructure we&apos;ve <span className="text-brand-blue">put to work.</span></>}
          action={<Link href="/projects" className="btn btn-outline">All projects <ArrowRight className="h-4 w-4" /></Link>} />
        <ProjectGrid projects={projects} />
      </div>
    </section>
  );
}

const STEPS = [
  { t: "Understand Requirements", b: "Site visit or call to map users, locations, workloads and constraints.", i: "clipboard" },
  { t: "Assess & Recommend", b: "A right-sized design and bill of materials with options for your budget.", i: "settings" },
  { t: "Supply & Procurement", b: "Genuine products sourced, staged and delivered on schedule.", i: "truck" },
  { t: "Installation & Configuration", b: "Professional installation, configuration, testing and documentation.", i: "wrench" },
  { t: "Support & Maintenance", b: "Ongoing support, maintenance and upgrades as you grow.", i: "support" },
];
export function ProcessSection() {
  return (
    <section className="relative overflow-hidden bg-mist py-24 md:py-32">
      <div className="container-x">
        <SectionHeading align="center" eyebrow="Our working process" title="From first call to long-term support." />
        <ol className="relative grid gap-6 md:grid-cols-5 md:gap-4">
          <div className="absolute left-7 top-0 h-full w-px bg-gradient-to-b from-brand-blue via-brand-blue/40 to-brand-red md:left-0 md:top-7 md:h-px md:w-full md:bg-gradient-to-r" aria-hidden />
          {STEPS.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.1}>
              <li className="relative flex gap-5 md:flex-col md:gap-0">
                <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-line bg-white text-brand-blue shadow-card">
                  <Icon name={s.i} className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-brand-red text-[11px] font-bold text-white">{i + 1}</span>
                </span>
                <div className="md:mt-6">
                  <h3 className="font-bold text-ink">{s.t}</h3>
                  <p className="mt-1.5 text-sm text-slate">{s.b}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

type T = { id: string; clientName: string; designation: string | null; organization: string | null; quote: string; image: string | null };
export function TestimonialsSection({ items }: { items: T[] }) {
  if (!items.length) return null; // never show fabricated testimonials
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="container-x">
        <SectionHeading align="center" eyebrow="Testimonials" title="What our clients say" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.id} delay={(i % 3) * 0.08}>
              <figure className="card flex h-full flex-col p-7">
                <Quote className="h-8 w-8 text-brand-red/70" />
                <blockquote className="mt-4 flex-1 leading-relaxed text-ink">{t.quote}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  {t.image ? <Image src={t.image} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" /> : <span className="grid h-11 w-11 place-items-center rounded-full bg-mist font-bold text-navy">{t.clientName[0]}</span>}
                  <span><span className="block font-bold text-ink">{t.clientName}</span><span className="text-sm text-slate">{[t.designation, t.organization].filter(Boolean).join(", ")}</span></span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

type Post = { id: string; title: string; slug: string; excerpt: string | null; coverImage: string | null; category: string; publishedAt: Date | null };
export function NewsSection({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  return (
    <section className="bg-mist py-24 md:py-32">
      <div className="container-x">
        <SectionHeading eyebrow="News & insights" title="Guides for smarter IT decisions." action={<Link href="/news" className="btn btn-outline">All articles <ArrowRight className="h-4 w-4" /></Link>} />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {posts.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.06}>
              <Link href={`/news/${p.slug}`} className="group card flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
                <div className="relative aspect-[16/10] overflow-hidden bg-ink">
                  {p.coverImage && <Image src={p.coverImage} alt="" fill sizes="(max-width:768px) 100vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" />}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-blue">{p.category}</p>
                  <h3 className="mt-2 font-bold leading-snug text-ink group-hover:text-brand-blue">{p.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate">{p.excerpt}</p>
                  {p.publishedAt && <time className="mt-auto pt-4 text-xs text-slate" dateTime={p.publishedAt.toISOString()}>{p.publishedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</time>}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 md:py-28">
      <Reveal>
        <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center text-white sm:px-12 md:py-24">
          <Image src="/media/server-rack.webp" alt="" fill sizes="100vw" className="object-cover opacity-25" />
          <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_50%_0%,rgba(8,101,197,.55),transparent_70%)]" />
          <div className="absolute inset-0 grid-bg opacity-60" />
          <div className="relative mx-auto max-w-3xl">
            <p className="eyebrow eyebrow-dot !text-white/70">Let&apos;s talk</p>
            <h2 className="display mt-5 text-4xl md:text-6xl">Let&apos;s Build a Smarter IT Infrastructure for Your Business.</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">Whether you need professional IT equipment, office networking or a complete technology infrastructure, our team is ready to help.</p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link href="/quote" className="btn btn-primary">Request a Business Quote <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/contact" className="btn btn-ghost">Contact Our Team</Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
