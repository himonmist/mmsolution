import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { ContactTabs } from "@/components/forms/ContactTabs";

export const metadata: Metadata = { title: "Request a Quote", description: "Request a corporate IT quotation or networking project proposal from MM Business Solution.", alternates: { canonical: "/quote" } };

export default function QuotePage() {
  return (
    <>
      <PageHero eyebrow="Request a quote" title="Get a tailored business proposal." body="Tell us what you need — equipment, a networking project or a complete office setup." crumbs={[["Request a Quote", "/quote"]]} />
      <section className="bg-mist py-16">
        <div className="container-x grid gap-8 lg:grid-cols-12">
          <div className="card p-6 md:p-10 lg:col-span-8"><ContactTabs initial="CORPORATE_QUOTE" types={["CORPORATE_QUOTE", "NETWORKING_PROJECT", "PRODUCT"]} /></div>
          <aside className="lg:col-span-4">
            <div className="rounded-3xl bg-ink p-8 text-white">
              <p className="eyebrow !text-glow">What happens next</p>
              <ol className="mt-5 space-y-4">
                {["We review your requirement", "An engineer contacts you to clarify details", "You receive an itemised quotation", "We schedule supply & installation"].map((t, i) => (
                  <li key={t} className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-glow" /><span><b className="text-white/50">0{i + 1}</b> {t}</span></li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
