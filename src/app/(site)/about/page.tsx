import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/PageHero";
import { IntroSection, WhySection, ProcessSection, FinalCta } from "@/components/home/Sections";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "About Us", description: "MM Business Solution — Bangladesh-based IT products supplier and technology solutions provider.", alternates: { canonical: "/about" } };

const AUDIENCES = ["Corporate organizations", "Government institutions", "Educational institutions", "SMEs and startups", "Banks and financial institutions", "Retail businesses", "Individual and enterprise customers"];

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <>
      <PageHero eyebrow="About us" title={s.about.heading} body={s.about.body} crumbs={[["About Us", "/about"]]} image="/media/workstation-set.webp" />
      <section className="bg-white py-20">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl"><Image src="/media/server-rack.webp" alt="Server rack installation" fill sizes="50vw" className="object-cover" /></div>
          <div className="space-y-6">
            <div className="card p-7"><p className="eyebrow">Our mission</p><p className="mt-3 text-lg text-ink">{s.about.mission}</p></div>
            <div className="card p-7"><p className="eyebrow">Our vision</p><p className="mt-3 text-lg text-ink">{s.about.vision}</p></div>
            <div><p className="eyebrow mb-3">Who we serve</p><div className="flex flex-wrap gap-2">{AUDIENCES.map((a) => <span key={a} className="rounded-full bg-mist px-4 py-2 text-sm font-semibold text-navy">{a}</span>)}</div></div>
          </div>
        </div>
      </section>
      <IntroSection intro={s.intro} stats={s.stats.custom} />
      <WhySection />
      <ProcessSection />
      <FinalCta />
    </>
  );
}
