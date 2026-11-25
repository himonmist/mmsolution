import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { FacebookIcon, LinkedinIcon, YoutubeIcon, WhatsappIcon } from "@/components/ui/icons";
import type { Settings } from "@/lib/settings";
import { whatsappLink } from "@/lib/whatsapp";
import { isSafeUrl } from "@/lib/security/url";
import type { Dict } from "@/lib/i18n/dict";

export function Footer({ settings, dict, categories, services }: { settings: Settings; dict: Dict; categories: { name: string; slug: string }[]; services: { title: string; slug: string }[] }) {
  const c = settings.contact;
  const wa = whatsappLink(c.whatsapp, "Hello MM Business Solution, I'd like to know more.");
  const socials = [
    { href: settings.social.facebook, label: "Facebook", I: FacebookIcon },
    { href: settings.social.linkedin, label: "LinkedIn", I: LinkedinIcon },
    { href: settings.social.youtube, label: "YouTube", I: YoutubeIcon },
  ].filter((s) => isSafeUrl(s.href));
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-ink text-white/70">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-brand-blue/20 blur-3xl" />
      <div className="container-x relative grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Image src="/brand/logo-reverse.png" alt="MM Business Solution" width={1226} height={639} className="h-14 w-auto" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed">
            Bangladesh-based IT products supplier and technology solutions provider — computers, networking, servers, security and the professional implementation that ties them together.
          </p>
          {socials.length > 0 && (
            <div className="mt-6 flex gap-2">
              {socials.map(({ href, label, I }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 transition hover:border-glow hover:text-white"><I className="h-4 w-4" /></a>
              ))}
            </div>
          )}
        </div>
        <FooterCol title="Quick links" links={[["/about", dict.nav.about], ["/products", dict.nav.products], ["/solutions", dict.nav.solutions], ["/brands", dict.nav.brands], ["/projects", dict.nav.projects], ["/news", dict.nav.news], ["/contact", dict.nav.contact]]} className="lg:col-span-2" />
        <FooterCol title="Products" links={categories.slice(0, 7).map((x) => [`/products?category=${x.slug}`, x.name])} className="lg:col-span-2" />
        <FooterCol title="Services" links={[...services.slice(0, 6).map((x) => [`/solutions/${x.slug}`, x.title]), ...(services.length > 6 ? [["/solutions", "All services →"]] : [])]} className="lg:col-span-2" />
        <div className="lg:col-span-3">
          <h3 className="text-sm font-bold text-white">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-glow" /><span className="whitespace-pre-line">{c.address}</span></li>
            <li><a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} className="flex gap-2 hover:text-white"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-glow" />{c.phone}</a></li>
            <li><a href={`mailto:${c.email}`} className="flex gap-2 break-all hover:text-white"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-glow" />{c.email}</a></li>
            {wa && <li><a href={wa} target="_blank" rel="noopener noreferrer" className="flex gap-2 hover:text-white"><WhatsappIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#25D366]" />WhatsApp</a></li>}
            <li className="flex gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-glow" />{c.hours}</li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs sm:flex-row">
          <p>© {year} {c.companyName}. All rights reserved. <span className="text-white/40">Smarter IT | Better Business</span></p>
          <div className="flex gap-5">
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms &amp; Conditions</Link>
            <Link href="/sitemap.xml" className="hover:text-white">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links, className }: { title: string; links: string[][]; className?: string }) {
  return (
    <div className={className}>
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map(([href, label]) => <li key={href}><Link href={href} className="transition hover:text-white">{label}</Link></li>)}
      </ul>
    </div>
  );
}
