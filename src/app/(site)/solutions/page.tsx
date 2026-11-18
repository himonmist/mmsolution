import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Icon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { ProcessSection, FinalCta } from "@/components/home/Sections";
import { getServices } from "@/lib/queries";

export const metadata: Metadata = { title: "Solutions & Services", description: "IT equipment supply, enterprise networking, server & data infrastructure, CCTV & security and complete office IT setup.", alternates: { canonical: "/solutions" } };

export default async function SolutionsPage() {
  const services = await getServices();
  return (
    <>
      <PageHero eyebrow="Solutions & services" title={<>Supply. Build. <span className="text-white/50">Support.</span></>} body="Professional IT implementation by engineers who plan, install, document and support your infrastructure." crumbs={[["Solutions & Services", "/solutions"]]} image="/media/server-rack.webp" />
      <section className="bg-white py-16 md:py-24">
        <div className="container-x space-y-6">
          {services.map((s, i) => (
            <Reveal key={s.id}>
              <article className={`card grid overflow-hidden md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div className="relative min-h-64 bg-ink">
                  {s.image ? <Image src={s.image} alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover opacity-80" /> : <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-navy to-brand-blue"><Icon name={s.icon} className="h-24 w-24 text-white/30" /></div>}
                </div>
                <div className="p-8 md:p-10">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-red/10 text-brand-red"><Icon name={s.icon} className="h-6 w-6" /></span>
                  <h2 className="display mt-5 text-3xl text-ink">{s.title}</h2>
                  <p className="mt-3 text-slate">{s.summary}</p>
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">{s.features.map((f) => <li key={f} className="flex gap-2 text-sm text-ink"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />{f}</li>)}</ul>
                  <Link href={`/solutions/${s.slug}`} className="btn btn-blue mt-7">Service details <ArrowRight className="h-4 w-4" /></Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <ProcessSection />
      <FinalCta />
    </>
  );
}
