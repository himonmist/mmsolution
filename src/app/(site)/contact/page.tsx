import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { ContactTabs } from "@/components/forms/ContactTabs";
import { FacebookFeed } from "@/components/site/FacebookFeed";
import { WhatsappIcon, LinkedinIcon } from "@/components/ui/icons";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/whatsapp";
import { isSafeUrl } from "@/lib/security/url";
import type { InquiryType } from "@/components/forms/InquiryForm";

export const metadata: Metadata = { title: "Contact Us", description: "Contact MM Business Solution for product inquiries, networking projects and corporate IT quotations.", alternates: { canonical: "/contact" } };
const TYPES = ["GENERAL", "PRODUCT", "NETWORKING_PROJECT", "CORPORATE_QUOTE"];

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const [s, sp] = [await getSettings(), await searchParams];
  const c = s.contact;
  const initial = (TYPES.includes(sp.type ?? "") ? sp.type : "GENERAL") as InquiryType;
  const wa = whatsappLink(c.whatsapp, "Hello MM Business Solution!");
  const mapOk = /^https:\/\/www\.google\.com\/maps\/embed\?/.test(c.mapEmbedUrl ?? "");
  return (
    <>
      <PageHero eyebrow="Contact us" title="Let's talk about your IT." body="Send an inquiry and our team will respond during business hours." crumbs={[["Contact Us", "/contact"]]} />
      <section className="bg-mist py-16">
        <div className="container-x grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            {[
              { I: MapPin, l: "Office", v: c.address },
              { I: Phone, l: "Phone", v: c.phone, h: `tel:${c.phone.replace(/[^\d+]/g, "")}` },
              { I: Mail, l: "Email", v: c.email, h: `mailto:${c.email}` },
              { I: Clock, l: "Business hours", v: c.hours },
            ].map(({ I, l, v, h }) => (
              <div key={l} className="card flex gap-4 p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-blue/10 text-brand-blue"><I className="h-5 w-5" /></span>
                <div><p className="text-xs font-bold uppercase tracking-wider text-slate">{l}</p>{h ? <a href={h} className="mt-1 block break-all font-bold text-ink hover:text-brand-blue">{v}</a> : <p className="mt-1 font-bold text-ink">{v}</p>}</div>
              </div>
            ))}
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn w-full bg-[#25D366] text-white"><WhatsappIcon className="h-5 w-5" />Chat on WhatsApp</a>}
            {isSafeUrl(s.social.linkedin) && <a href={s.social.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full"><LinkedinIcon className="h-4 w-4" />Follow us on LinkedIn</a>}
            {s.social.showFacebookFeed && isSafeUrl(s.social.facebook) && <FacebookFeed pageUrl={s.social.facebook} />}
          </div>
          <div className="card p-6 md:p-10 lg:col-span-8"><ContactTabs initial={initial} /></div>
        </div>
        {mapOk && <div className="container-x mt-8"><iframe title="Office location" src={c.mapEmbedUrl} className="h-80 w-full rounded-3xl border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" sandbox="allow-scripts allow-same-origin allow-popups" /></div>}
      </section>
    </>
  );
}
